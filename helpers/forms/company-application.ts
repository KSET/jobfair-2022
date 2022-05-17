import {
  MaybeRef,
} from "@vueuse/shared";
import {
  IApplicationCocktail,
  IApplicationPresenter,
  IApplicationTalk,
  IApplicationWorkshop,
  ICompanyApplicationFeedback,
  IImage,
} from "~/graphql/schema";
import {
  InputEntry,
} from "~/components/util/form/app-formgroup.vue";
import {
  Language,
} from "~/store/translations";
import {
  computed,
  unref,
} from "#imports";

const withRandomName =
  <T>(
    fn: ({
      name,
    }: {
      name: string,
    }) => T,
  ): T =>
    fn({
      name: 0.5 >= Math.random() ? "Marko" : "Ana",
    })
;

export type Presenter = Pick<IApplicationPresenter,
  "firstName"
  | "lastName"
  | "bioEn"
  | "bioHr"> & {
  photo?: (
    Pick<IImage,
      "uid"
      | "name">
    & {
    full: Pick<IImage["full"], "mimeType">,
  }
    ) | null,
};
export const companyApplicationPresenterCreate =
  <T extends Presenter>(presenter?: T | null) =>
    (
      {
        requireHr = false,
      } = {},
    ): Record<keyof Presenter, InputEntry> =>
      withRandomName(({ name }) => ({
        firstName: {
          value: presenter?.firstName || "",
          type: "text" as const,
          placeholder: name,
        },

        lastName: {
          value: presenter?.lastName || "",
          type: "text" as const,
          placeholder: "Horvat",
        },
        bioEn: {
          value: presenter?.bioEn || "",
          type: "textarea" as const,
          placeholder: `${ name } Horvat is a good developer in our company.`,
        },
        bioHr: {
          value: presenter?.bioHr || "",
          type: "textarea" as const,
          placeholder: `${ name } Horvat je dobar developer u našoj firmi.`,
          required: requireHr,
        },
        photo: {
          value: presenter?.photo?.uid ? `/api/i/${ presenter.photo.uid }/full` : "",
          fileName: presenter?.photo?.name,
          fileType: presenter?.photo?.full?.mimeType,
          accept: "image/png,image/jpeg",
          type: "file",
        },
      }))
;

export type Talk = Omit<IApplicationTalk,
  "_count"
  | "forCompanyId"
  | "presenters"
  | "categoryId"
  | "createdAt"
  | "updatedAt"
  | "event"
  | "uid">
  ;
export const companyApplicationTalkCreate =
  <T extends Talk>(talk?: T | null) =>
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
          value: talk?.category.name || categories[0] || "",
          type: "dropdown" as const,
          options: categories.map((x) => ({ label: x, value: x })),
        },
      })
;

export type Workshop = Omit<IApplicationWorkshop,
  "_count"
  | "forCompanyId"
  | "presenters"
  | "createdAt"
  | "updatedAt"
  | "reservation"
  | "event"
  | "uid">;
export const companyApplicationWorkshopCreate =
  <T extends Workshop>(workshop?: T | null) =>
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

export type Cocktail = Omit<IApplicationCocktail,
  "_count"
  | "forApplication"
  | "uid">;
export const companyApplicationCocktailCreate =
  <T extends Cocktail>(cocktail?: T | null) =>
    (): Record<keyof Cocktail, InputEntry> =>
      ({
        name: {
          value: cocktail?.name || "",
          type: "text" as const,
          placeholder: "StreaKSET",
        },
        colour: {
          value: cocktail?.colour || "",
          type: "text" as const,
          placeholder: "KSET orange (#ff7000)",
        },
      })
;

export type FeedbackDate = Pick<ICompanyApplicationFeedback,
  "dateRating"
  | "timeRating"
  | "dateComments">;
export const companyApplicationFeedbackDate =
  <T extends FeedbackDate>(feedback?: T | null) =>
    (): Record<keyof FeedbackDate, InputEntry> =>
      ({
        dateRating: {
          value: feedback?.dateRating ?? null,
          type: "slider" as const,
          min: 1,
          max: 10,
          step: 1,
        },
        timeRating: {
          value: feedback?.timeRating ?? null,
          type: "slider" as const,
          min: 1,
          max: 10,
          step: 1,
        },
        dateComments: {
          value: feedback?.dateComments || "",
          type: "textarea" as const,
          required: false,
        },
      })
;

export type FeedbackOrganisation = Pick<ICompanyApplicationFeedback,
  "applicationRating"
  | "onsiteRating"
  | "foodRating"
  | "applicationComments">;
export const companyApplicationFeedbackOrganisation =
  <T extends FeedbackOrganisation>(feedback?: T | null) =>
    (): Record<keyof FeedbackOrganisation, InputEntry> =>
      ({
        applicationRating: {
          value: feedback?.applicationRating ?? null,
          type: "slider" as const,
          min: 1,
          max: 10,
          step: 1,
        },
        onsiteRating: {
          value: feedback?.onsiteRating ?? null,
          type: "slider" as const,
          min: 1,
          max: 10,
          step: 1,
        },
        foodRating: {
          value: feedback?.foodRating ?? null,
          type: "slider" as const,
          min: 1,
          max: 10,
          step: 1,
        },
        applicationComments: {
          value: feedback?.applicationComments || "",
          type: "textarea" as const,
          required: false,
        },
      })
;

export type FeedbackExperience = Pick<ICompanyApplicationFeedback,
  "attendanceRating"
  | "mostLiked"
  | "experienceComments">;
export const companyApplicationFeedbackExperience =
  <T extends FeedbackExperience>(feedback?: T | null) =>
    ({
      mostLiked = [] as MaybeRef<string[]>,
    } = {}): Record<keyof FeedbackExperience, InputEntry> =>
      ({
        attendanceRating: {
          value: feedback?.attendanceRating ?? null,
          type: "slider" as const,
          min: 1,
          max: 10,
          step: 1,
        },
        mostLiked: {
          // eslint-disable-next-line no-bitwise
          value: unref(mostLiked).map((_, i) => (feedback?.mostLiked ?? 0) & Math.pow(2, i)).filter((x) => x).map(String),
          type: "dropdown" as const,
          options: computed(() => unref(mostLiked).map((label, i) => ({
            label,
            value: Math.pow(2, i).toString(),
          }))),
        },
        experienceComments: {
          value: feedback?.experienceComments || "",
          type: "textarea" as const,
          required: false,
        },
      })
;

export type FeedbackOverall = Pick<ICompanyApplicationFeedback,
  "overallRating"
  | "recommended"
  | "testimonial">;
export const companyApplicationFeedbackOverall =
  <T extends FeedbackOverall>(feedback?: T | null) =>
    ({
      recommended = [] as MaybeRef<string[]>,
    } = {}): Record<keyof FeedbackOverall, InputEntry> =>
      ({
        overallRating: {
          value: feedback?.overallRating ?? null,
          type: "slider" as const,
          min: 1,
          max: 10,
          step: 1,
        },
        recommended: {
          value: String(feedback?.recommended ?? ""),
          type: "dropdown" as const,
          options: computed(() => unref(recommended).map((label, i) => ({
            label,
            value: Math.pow(2, i).toString(),
          }))),
        },
        testimonial: {
          value: feedback?.testimonial || "",
          type: "textarea" as const,
          required: false,
        },
      })
;
