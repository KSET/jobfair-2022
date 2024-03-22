import {
  prisma,
} from "../providers/prisma";
import {
  VatValidationService,
} from "./vat-validation-service";

export class CompanyService {
  public static async validateVat(untrustedVat: string) {
    untrustedVat = untrustedVat.trim().toUpperCase();

    const valid = await VatValidationService.validate(untrustedVat);

    const validVatInfo = valid.info;

    if (!valid.valid || !validVatInfo) {
      return {
        valid: false as const,
        exists: false as const,
        info: null,
      };
    }

    const exists = await prisma.company.findFirst({
      where: {
        vat: validVatInfo.vat,
      },
    });

    if (exists) {
      return {
        valid: true as const,
        exists: true as const,
        info: null,
      };
    }

    return {
      valid: true as const,
      exists: false as const,
      info: validVatInfo,
    };
  }
}
