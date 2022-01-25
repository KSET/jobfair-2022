import {
  MaybeRef,
} from "@vueuse/shared";
import {
  ICompany,
} from "~/graphql/schema";
import {
  InputEntry,
} from "~/components/util/form/app-formgroup.vue";

type Company = Omit<ICompany, "industryId" | "_count" | "uid">;
export const companyCreate =
  <T extends Company>(company?: T) =>
    (industries: MaybeRef<{ label: string, value: string, }[]>): Record<keyof Company, InputEntry> =>
      ({
        vat: {
          value: company?.vat ?? "",
          type: "text" as const,
          disabled: true,
        },
        address: {
          value: company?.address ?? "",
          type: "text" as const,
          placeholder: "Unska ul. 3, 10000, Zagreb",
        },
        legalName: {
          value: company?.legalName ?? "",
          type: "text" as const,
          placeholder: "Elektrostudent d.o.o.",
        },
        brandName: {
          value: company?.brandName ?? "",
          type: "text" as const,
          placeholder: "KSET",
        },
        website: {
          value: company?.website ?? "",
          type: "text" as const,
          placeholder: "https://www.kset.org",
        },
        industry: {
          value: company?.industry?.name ?? "",
          type: "dropdown" as const,
          placeholder: "Mobile and web development",
          options: industries,
        },
        descriptionEn: {
          value: company?.descriptionEn ?? "",
          type: "textarea" as const,
        },
        descriptionHr: {
          value: company?.descriptionHr ?? "",
          type: "textarea" as const,
        },
      })
;
