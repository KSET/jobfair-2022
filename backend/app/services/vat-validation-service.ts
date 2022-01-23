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

const checkVat = async (info: CheckVatArgs) => {
  const client = await createClientAsync(URL);

  const check = client.checkVatAsync as (args: CheckVatArgs) => Promise<[ CheckVatResponse, string, undefined, string, undefined ]>;

  return check(info);
};

export class VatValidationService {
  public static async validate(vat: string) {
    const info = await this.remoteInfo(vat);

    return {
      valid: this.validateLocal(vat) || null !== info,
      info,
    };
  }

  public static async remoteInfo(vat: string) {
    if (3 > vat.length) {
      return null;
    }

    const countryCode = vat.slice(0, 2);
    const vatNumber = vat.slice(2);

    if (isNaN(Number(vatNumber))) {
      return null;
    }

    try {
      const [ result ] = await checkVat({
        countryCode,
        vatNumber,
      });

      if (!result.valid) {
        return null;
      }

      return this.formatRemote(result);
    } catch {
      return null;
    }
  }

  private static async validateRemote(vat: string) {
    const data = await this.remoteInfo(vat);

    return null !== data;
  }

  private static validateLocal(vat: string) {
    const { isValid } = checkVAT(vat, countriesWithoutBrazil);

    return isValid;
  }

  private static formatRemote(remoteData: { name: string, address: string, }) {
    const {
      name,
      address,
    } = remoteData;

    return {
      address,
      legalName: name,
    };
  }
}
