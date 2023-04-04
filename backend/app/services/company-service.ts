import {
  prisma,
} from "../providers/prisma";
import {
  VatValidationService,
} from "./vat-validation-service";

export class CompanyService {
  public static async validateVat(vat: string) {
    vat = vat.trim().toUpperCase();

    const exists = await prisma.company.findFirst({
      where: {
        vat,
      },
    });

    if (exists) {
      return {
        valid: true,
        exists: true,
        info: null,
      };
    }

    const valid = await VatValidationService.validate(vat);

    return {
      ...valid,
      exists: false,
    };
  }
}
