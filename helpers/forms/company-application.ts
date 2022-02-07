import {
  IApplicationPresenter,
  IApplicationTalk,
  IApplicationWorkshop,
} from "~/graphql/schema";
import {
  InputEntry,
} from "~/components/util/form/app-formgroup.vue";
import {
  Language,
} from "~/store/translations";

export type Presenter = Omit<IApplicationPresenter,
  "_count"
  | "photoId">;
export const companyApplicationPresenterCreate =
  <T extends Presenter>(presenter?: T) =>
    (
      {
        requireHr = false,
      } = {},
    ): Record<keyof Presenter, InputEntry> =>
      ({
        firstName: {
          value: presenter?.firstName || "",
          type: "text" as const,
          placeholder: "Marko",
        },

        lastName: {
          value: presenter?.lastName || "",
          type: "text" as const,
          placeholder: "Horvat",
        },
        bioEn: {
          value: presenter?.bioEn || "",
          type: "textarea" as const,
          placeholder: "Marko Horvat is a good developer in our company.",
        },
        bioHr: {
          value: presenter?.bioHr || "",
          type: "textarea" as const,
          placeholder: "Marko Horvat je dobar developer u našoj firmi.",
          required: requireHr,
        },
      })
;

export type Talk = Omit<IApplicationTalk,
  "_count"
  | "forCompanyId"
  | "presenters"
  | "categoryId"
  | "uid"> & {
  category: string,
};
export const companyApplicationTalkCreate =
  <T extends Talk>(talk?: T) =>
    (
      {
        requireHr = false,
        categories = [] as string[],
      } = {},
    ): Record<keyof Talk, InputEntry> =>
      ({
        titleEn: {
          value: talk?.titleEn || "",
          type: "text" as const,
        },
        titleHr: {
          value: talk?.titleHr || "",
          type: "text" as const,
          required: requireHr,
        },
        descriptionEn: {
          value: talk?.descriptionEn || "",
          type: "textarea" as const,
          placeholder: "This description is used in promotions towards students hence You should address the student directly.",
        },
        descriptionHr: {
          value: talk?.descriptionHr || "",
          type: "textarea" as const,
          required: requireHr,
          placeholder: "Opis se koristi za promociju prema studentima te se ovim tekstom obraćate izravno studentu.",
        },
        language: {
          value: talk?.language || Language.HR,
          type: "dropdown" as const,
          options: Object.entries(Language).map(([ label, value ]) => ({ label, value })),
        },
        category: {
          value: talk?.category || categories[0] || "",
          type: "dropdown" as const,
          options: categories.map((x) => ({ label: x, value: x })),
        },
      })
;

export type Workshop = Omit<IApplicationWorkshop,
  "_count"
  | "forCompanyId"
  | "presenters"
  | "uid">;
export const companyApplicationWorkshopCreate =
  <T extends Workshop>(workshop?: T) =>
    (
      {
        requireHr = false,
      } = {},
    ): Record<keyof Workshop, InputEntry> =>
      ({
        titleEn: {
          value: workshop?.titleEn || "",
          type: "text" as const,
        },
        titleHr: {
          value: workshop?.titleHr || "",
          type: "text" as const,
          required: requireHr,
        },
        descriptionEn: {
          value: workshop?.descriptionEn || "",
          type: "textarea" as const,
          placeholder: "This description is used in promotions towards students hence You should address the student directly.",
        },
        descriptionHr: {
          value: workshop?.descriptionHr || "",
          type: "textarea" as const,
          required: requireHr,
          placeholder: "Opis se koristi za promociju prema studentima te se ovim tekstom obraćate izravno studentu.",
        },
        language: {
          value: workshop?.language || Language.HR,
          type: "dropdown" as const,
          options: Object.entries(Language).map(([ label, value ]) => ({ label, value })),
        },
        goal: {
          value: workshop?.goal || "",
          type: "textarea" as const,
          placeholder: "npr. Naučiti napraviti API pomoću ExpressJS biblioteke",
        },
        notesEn: {
          value: workshop?.notesEn || "",
          type: "textarea" as const,
          placeholder: "Notes to students. Eg. bring laptops with NodeJS installed. This description is used in promotions towards students hence You should address the student directly.",
          required: false,
        },
        notesHr: {
          value: workshop?.notesHr || "",
          type: "textarea" as const,
          required: false,
          placeholder: "Napomene za studente. Npr. donesite laptope s instaliranim NodeJS. Opis se koristi za promociju prema studentima te se ovim tekstom obraćate izravno studentu.",
        },
      })
;
