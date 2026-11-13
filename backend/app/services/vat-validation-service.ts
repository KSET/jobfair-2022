import {
  createClientAsync,
} from "soap";
import {
  checkVAT,
  countries,
} from "jsvat";

const countriesWithoutBrazil = countries.filter(({ name }) => "Brazil" !== name);

const URL = "https://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl";

type CheckVatArgs = {
  countryCode: string,
  vatNumber: string,
};

type CheckVatResponse = {
  countryCode: string,
  vatNumber: string,
  requestDate: Date,
  valid: boolean,
  name: string,
  address: string,
};

type VatInfo = {
  address: string,
  legalName: string,
  vat: string,
};

export type VatLookupResult =
  | { kind: "VALID", info: VatInfo, }
  | { kind: "INVALID", }
  | { kind: "ERROR", code: string, message: string, transient: boolean, }
  ;

const TRANSIENT_FAULTS = new Set([
  "MS_MAX_CONCURRENT_REQ",
  "GLOBAL_MAX_CONCURRENT_REQ",
  "MS_UNAVAILABLE",
  "SERVICE_UNAVAILABLE",
  "TIMEOUT",
]);

let clientPromise: ReturnType<typeof createClientAsync> | null = null;

const getClient = () => {
  if (!clientPromise) {
    clientPromise = createClientAsync(URL).catch((e: unknown) => {
      clientPromise = null;
      throw e;
    });
  }

  return clientPromise;
};

const checkVat = async (info: CheckVatArgs) => {
  const client = await getClient();

  const check = client.checkVatAsync as (args: CheckVatArgs) => Promise<[ CheckVatResponse, string, undefined, string, undefined ]>;

  return check(info);
};

const toLookupError = (e: unknown): VatLookupResult => {
  const err = e as { root?: { Envelope?: { Body?: { Fault?: { faultstring?: unknown, }, }, }, }, message?: unknown, } | null;
  const fault = err?.root?.Envelope?.Body?.Fault?.faultstring;

  if ("string" === typeof fault && fault) {
    return {
      kind: "ERROR",
      code: fault,
      message: fault,
      transient: TRANSIENT_FAULTS.has(fault),
    };
  }

  return {
    kind: "ERROR",
    code: "NETWORK",
    message: "string" === typeof err?.message ? err.message : "VIES request failed",
    transient: true,
  };
};

export class VatValidationService {
  public static async validate(vat: string) {
    const result = await this.lookup(vat);

    if ("VALID" !== result.kind) {
      return {
        valid: false,
        info: null,
      };
    }

    return {
      valid: true,
      info: result.info,
    };
  }

  public static lookup(vat: string): Promise<VatLookupResult> {
    const validatedVat = this.validateLocal(vat);

    if (!validatedVat) {
      return Promise.resolve({ kind: "INVALID" });
    }

    return this.remoteLookup(validatedVat);
  }

  public static async remoteInfo(vat: string) {
    const result = await this.remoteLookup(vat);

    return "VALID" === result.kind ? result.info : null;
  }

  private static async remoteLookup(vat: string): Promise<VatLookupResult> {
    if (3 > vat.length) {
      return { kind: "INVALID" };
    }

    const countryCode = vat.slice(0, 2);
    const vatNumber = vat.slice(2);

    try {
      const [ result ] = await checkVat({
        countryCode,
        vatNumber,
      });

      if (!result.valid) {
        return { kind: "INVALID" };
      }

      return { kind: "VALID", info: this.formatRemote(result) };
    } catch (e) {
      return toLookupError(e);
    }
  }

  private static validateLocal(vat: string) {
    const { isValid, value } = checkVAT(vat, countriesWithoutBrazil);

    if (!isValid) {
      return null;
    }

    if (!value) {
      return null;
    }

    return value;
  }

  private static formatRemote(remoteData: CheckVatResponse): VatInfo {
    const {
      name,
      address,
      vatNumber,
      countryCode,
    } = remoteData;

    return {
      address,
      legalName: name,
      vat: countryCode + vatNumber,
    };
  }
}
