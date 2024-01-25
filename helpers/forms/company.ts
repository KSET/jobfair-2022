import {
  unref,
} from "vue";
import {
  type MaybeRef,
} from "~/helpers/type";
import {
  type ICompany,
  type IUser,
  type IFile,
  type IImage,
  type ICompanyPanel,
  type IApplicationPresenter,
} from "~/graphql/schema";
import {
  type InputEntry,
} from "~/components/util/form/app-formgroup.vue";

type Company = Omit<ICompany,
  "_count"
  | "industryId"
  | "members"
  | "program"
  | "createdAt"
  | "updatedAt"
  | "uid"> & {
  vectorLogo: Pick<IFile,
    "uid"
    | "name"
    | "mimeType">,
  rasterLogo: Pick<IImage,
      "uid"
      | "name">
    & {
    full: Pick<IImage["full"], "mimeType">,
  },
};
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
        vectorLogo: {
          value: company?.vectorLogo?.uid ? `/api/file/${ company.vectorLogo.uid }` : "",
          fileName: company?.vectorLogo?.name,
          fileType: company?.vectorLogo?.mimeType,
          accept: "application/pdf,.ai,.pdf,.eps",
          type: "file" as const,
        },
        rasterLogo: {
          value: company?.rasterLogo?.uid ? `/api/i/${ company.rasterLogo.uid }/full` : "",
          fileName: company?.rasterLogo?.name,
          fileType: company?.rasterLogo?.full?.mimeType,
          accept: "image/png",
          type: "file",
        },
      })
;

type User = Pick<IUser,
  "uid"
  | "name"
  | "email">
  ;
export const companyMembersEdit =
  <T extends User>(members?: T[]) =>
    (users?: MaybeRef<User[]>): Record<"members", InputEntry> =>
      ({
        members: {
          type: "dropdown",
          value: members?.map((member) => member.uid) || [],
          options: unref(users)?.map((user) => ({ label: `${ user.name } (${ user.email })`, value: user.uid })) || [],
        },
      })
;

type Panelist = Pick<IApplicationPresenter, "firstName" | "lastName"> & {
  company: Pick<ICompany, "uid" | "brandName">,
};
type CompanyPanel = Pick<ICompanyPanel, "name" | "description"> & {
  companies: Pick<ICompany, "uid">[],
};
export const companyPanelListCreate =
  <T extends CompanyPanel>(item?: T | null) =>
    (panelists: MaybeRef<Panelist[]>): Record<keyof CompanyPanel, InputEntry> => ({
      name: {
        value: item?.name ?? "",
        type: "text" as const,
        placeholder: "Ime panela",
      },
      description: {
        value: item?.description ?? "",
        type: "textarea" as const,
        placeholder: "Opis panela",
      },
      companies: {
        value: item?.companies?.map((company) => company.uid) || [],
        type: "dropdown" as const,
        options: unref(panelists).map((panelist) => ({
          label: `[${ panelist.company.brandName }] ${ panelist.firstName } ${ panelist.lastName }`,
          value: panelist.company.uid,
        })),
      },
    })
;
