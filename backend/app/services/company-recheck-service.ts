import {
  prisma,
} from "../providers/prisma";
import type {
  VatLookupResult,
} from "./vat-validation-service";
import {
  VatValidationService,
} from "./vat-validation-service";

export const RECHECK_CONCURRENCY = 4;
export const RECHECK_MAX_BATCH = 25;
const RETRY_DELAYS_MS = [ 1000, 2000 ];

export type RecheckStatus =
  | "UNCHANGED"
  | "CHANGED"
  | "UNVERIFIABLE"
  | "INVALID"
  | "FAILED"
  | "NO_IDENTIFIER"
  ;

export type RecheckInfo = {
  legalName: string,
  address: string,
};

export type RecheckResult = {
  uid: string,
  vat: string,
  brandName: string,
  status: RecheckStatus,
  storedLegalName: string,
  storedAddress: string,
  apiLegalName: string | null,
  apiAddress: string | null,
  legalNameChanged: boolean,
  addressChanged: boolean,
  error: string | null,
};

type StoredCompany = {
  uid: string,
  vat: string,
  brandName: string,
  legalName: string,
  address: string,
};

export type Lookup = (vat: string) => Promise<VatLookupResult>;

const defaultLookup: Lookup = (vat) => VatValidationService.lookup(vat.trim().toUpperCase());

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const lookupWithRetry = async (lookup: Lookup, vat: string, delays: number[]) => {
  let result = await lookup(vat);

  for (const delay of delays) {
    if ("ERROR" !== result.kind || !result.transient) {
      break;
    }

    await sleep(delay);
    result = await lookup(vat);
  }

  return result;
};

export const formatValue = (value: string) =>
  value
    .replace(/\s*[\r\n]+\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim()
;

export const comparisonKey = (value: string) =>
  formatValue(value)
    .toLocaleLowerCase("hr")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
;

const isUsable = (value: string | null | undefined): value is string => {
  const formatted = formatValue(value ?? "");
  return "" !== formatted && "---" !== formatted;
};

const isSet = (value: string | null | undefined): value is string =>
  null !== value && undefined !== value;

export const hasIdentifier = (vat: string) => isUsable(vat);

const differs = (stored: string, api: string) =>
  comparisonKey(stored) !== comparisonKey(api);

export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;

  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );

  return results;
}

export async function recheckCompany(
  company: StoredCompany,
  lookup: Lookup = defaultLookup,
  retryDelays: number[] = RETRY_DELAYS_MS,
): Promise<RecheckResult> {
  const base = {
    uid: company.uid,
    vat: company.vat,
    brandName: company.brandName,
    storedLegalName: company.legalName,
    storedAddress: company.address,
    apiLegalName: null,
    apiAddress: null,
    legalNameChanged: false,
    addressChanged: false,
    error: null,
  };

  if (!hasIdentifier(company.vat)) {
    return { ...base, status: "NO_IDENTIFIER" };
  }

  try {
    const result = await lookupWithRetry(lookup, company.vat, retryDelays);

    if ("INVALID" === result.kind) {
      return { ...base, status: "INVALID", error: "VIES: VAT nije valjan" };
    }

    if ("ERROR" === result.kind) {
      return {
        ...base,
        status: "FAILED",
        error:
          result.transient
            ? `VIES privremeno nedostupan (${ result.code }), pokušaj ponovno`
            : `VIES greška (${ result.code })`,
      };
    }

    const nameUsable = isUsable(result.info.legalName);
    const addressUsable = isUsable(result.info.address);

    if (!nameUsable && !addressUsable) {
      return { ...base, status: "UNVERIFIABLE", error: "VIES nije vratio naziv ni adresu" };
    }

    const apiLegalName = nameUsable ? formatValue(result.info.legalName) : null;
    const apiAddress = addressUsable ? formatValue(result.info.address) : null;
    const legalNameChanged = null !== apiLegalName && differs(company.legalName, apiLegalName);
    const addressChanged = null !== apiAddress && differs(company.address, apiAddress);

    let note: string | null = null;
    if (!nameUsable) {
      note = "VIES nije vratio pravni naziv";
    } else if (!addressUsable) {
      note = "VIES nije vratio adresu";
    }

    return {
      ...base,
      apiLegalName,
      apiAddress,
      legalNameChanged,
      addressChanged,
      error: note,
      status: legalNameChanged || addressChanged ? "CHANGED" : "UNCHANGED",
    };
  } catch (e) {
    return { ...base, status: "FAILED", error: (e as Error)?.message ?? "Lookup failed" };
  }
}

export type ApplyRequest = {
  uid: string,
  legalName?: string | null,
  address?: string | null,
  storedLegalName: string,
  storedAddress: string,
};

type FieldChange = { from: string, to: string, };

export type ApplyResult = {
  uid: string,
  updated: boolean,
  error: string | null,
  changes: Partial<Record<keyof RecheckInfo, FieldChange>>,
};

export type ApplyUpdate = (
  uid: string,
  where: Partial<RecheckInfo>,
  data: Partial<RecheckInfo>,
) => Promise<number>;

const defaultUpdate: ApplyUpdate = async (uid, where, data) => {
  const { count } = await prisma.company.updateMany({
    where: { uid, ...where },
    data,
  });

  return count;
};

export class CompanyRecheckService {
  public static async recheck(
    uids: string[],
    lookup: Lookup = defaultLookup,
  ): Promise<RecheckResult[]> {
    const unique = [ ...new Set(uids) ].slice(0, RECHECK_MAX_BATCH);

    const companies = await prisma.company.findMany({
      where: { uid: { in: unique } },
      select: { uid: true, vat: true, brandName: true, legalName: true, address: true },
    });

    return mapWithConcurrency(
      companies,
      RECHECK_CONCURRENCY,
      (company) => recheckCompany(company, lookup),
    );
  }

  public static apply(
    requests: ApplyRequest[],
    update: ApplyUpdate = defaultUpdate,
  ): Promise<ApplyResult[]> {
    const requested = requests
      .filter(({ legalName, address }) => isSet(legalName) || isSet(address))
      .slice(0, RECHECK_MAX_BATCH);

    return mapWithConcurrency(requested, RECHECK_CONCURRENCY, async (request): Promise<ApplyResult> => {
      const fail = (error: string): ApplyResult => ({ uid: request.uid, updated: false, error, changes: {} });

      const where: Partial<RecheckInfo> = {};
      const data: Partial<RecheckInfo> = {};
      const changes: ApplyResult["changes"] = {};

      if (isSet(request.legalName)) {
        if (!isUsable(request.legalName)) {
          return fail("Prazan pravni naziv");
        }
        where.legalName = request.storedLegalName;
        data.legalName = formatValue(request.legalName);
        changes.legalName = { from: request.storedLegalName, to: data.legalName };
      }

      if (isSet(request.address)) {
        if (!isUsable(request.address)) {
          return fail("Prazna adresa");
        }
        where.address = request.storedAddress;
        data.address = formatValue(request.address);
        changes.address = { from: request.storedAddress, to: data.address };
      }

      try {
        const count = await update(request.uid, where, data);

        if (0 === count) {
          return fail("Podaci firme su u međuvremenu promijenjeni, pokreni provjeru ponovno");
        }

        return { uid: request.uid, updated: true, error: null, changes };
      } catch (e) {
        return fail((e as Error)?.message ?? "Update failed");
      }
    });
  }
}
