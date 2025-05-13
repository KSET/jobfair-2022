import {
 asDate,
} from "../date";
import {
  type MaybeRef,
} from "~/helpers/type";
import {
  type IApplicationCocktail,
  type IApplicationInternship,
  type IApplicationPresenter,
  type IApplicationTalk,
  type IApplicationWorkshop,
  type ICompanyApplicationContactPerson,
  type ICompanyApplicationFeedback,
  type IImage,
} from "~/graphql/schema";
import {
  type InputEntry,
} from "~/components/util/form/app-formgroup.types";
import {
  Language,
} from "~/store/translations";
import {
  computed,
  unref,
} from "#imports";

export type ContactPerson = Pick<
  ICompanyApplicationContactPerson,
  "name" | "email" | "phone"
>;
export const companyApplicationContactPersonCreate =
  <T extends ContactPerson>(contactPerson?: T | null) =>
  (): Record<keyof ContactPerson, InputEntry> => ({
    name: {
      value: contactPerson?.name || "",
      type: "text" as const,
      placeholder: "Matija Horvat",
    },
    email: {
      value: contactPerson?.email || "",
      type: "email" as const,
      placeholder: "matija.horvat@example.com",
    },
    phone: {
      value: contactPerson?.phone || "",
      type: "tel" as const,
      placeholder: "+385987654321",
    },
  });

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
      ({
        firstName: {
          value: presenter?.firstName || "",
          type: "text" as const,
          placeholder: "Matija",
        },

        lastName: {
          value: presenter?.lastName || "",
          type: "text" as const,
          placeholder: "Horvat",
        },
        bioEn: {
          value: presenter?.bioEn || "",
          type: "textarea" as const,
          placeholder: "Matija Horvat is a good developer in our company.",
        },
        bioHr: {
          value: presenter?.bioHr || "",
          type: "textarea" as const,
          placeholder: "Matija Horvat ima značajna postignuća u našoj firmi.",
          required: requireHr,
        },
        photo: {
          value: presenter?.photo?.uid ? `/api/i/${ presenter.photo.uid }/full` : "",
          fileName: presenter?.photo?.name,
          fileType: presenter?.photo?.full?.mimeType,
          accept: "image/png,image/jpeg",
          type: "file",
        },
      })
;

export type Talk = Omit<IApplicationTalk,
  "_count"
  | "forCompanyId"
  | "presenters"
  | "categoryId"
  | "createdAt"
  | "updatedAt"
  | "event"
  | "reservation"
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
          value: talk?.category?.name || categories[0] || "",
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
  | "forSeason"
  | "createdAt"
  | "updatedAt"
  | "uid">;
  export const companyApplicationCocktailCreate =
  <T extends Cocktail>(cocktail?: T | null) =>
    (
      {
        cocktailTypes = [] as string[],
      } = {},
    ): Record<keyof Cocktail, InputEntry> =>
      ({
        name: {
          value: cocktail?.name || "",
          type: "text" as const,
          placeholder: "StreaKSET",
        },
        type: {
          value: cocktail?.type?.type || cocktailTypes[0] || "",
          type: "dropdown" as const,
          options: cocktailTypes.map((x) => ({ label: x, value: x })),
        },
      });

export type Internship = Omit<IApplicationInternship,
  "_count"
  | "forSeason"
  | "createdAt"
  | "updatedAt"
  | "company"
  | "uid">;
export const companyApplicationInternshipCreate =
  <T extends Internship>(internship?: T | null) =>
    (
    ): Record<keyof Internship, InputEntry> =>
    ({
      position: {
        value: internship?.position || "",
        type: "text" as const,
        placeholder: "Junior Software Engineer",
      },
      competencies: {
        value: internship?.competencies || "",
        type: "text" as const,
        placeholder: "Frontend, Vue.js, GraphQL, Node.js...",
      },
      description: {
        value: internship?.description || "",
        type: "textarea" as const,
        placeholder: "Opis se koristi za promociju prema studentima te se ovim tekstom obraćate izravno studentu.",
      },
      workingPeriodStart: {
        value:
        internship?.workingPeriodStart
          ? asDate(internship?.workingPeriodStart)
          : "",
        type: "date" as const,
      },
      workingPeriodEnd: {
        value:
        internship?.workingPeriodEnd
          ? asDate(internship?.workingPeriodEnd)
          : "",
        type: "date" as const,
      },
      duration: {
        value: internship?.duration || "",
        type: "text" as const,
        placeholder: "2 tjedna",
      },
      url: {
        value: internship?.url || "",
        type: "text" as const,
        placeholder: "Informativni link na kojemu studenti mogu pročitati više o praksi",
      },
});


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
          type: "number-range" as const,
          min: 1,
          max: 10,
        },
        timeRating: {
          value: feedback?.timeRating ?? null,
          type: "number-range" as const,
          min: 1,
          max: 10,
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
          type: "number-range" as const,
          min: 1,
          max: 10,
        },
        onsiteRating: {
          value: feedback?.onsiteRating ?? null,
          type: "number-range" as const,
          min: 1,
          max: 10,
        },
        foodRating: {
          value: feedback?.foodRating ?? null,
          type: "number-range" as const,
          min: 1,
          max: 10,
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
          type: "number-range" as const,
          min: 1,
          max: 10,
        },
        mostLiked: {
          // eslint-disable-next-line no-bitwise
          value: unref(mostLiked).map((_, i) => (feedback?.mostLiked ?? 0) & Math.pow(2, i)).filter((x) => x).map(String),
          type: "multi-pick" as const,
          options: computed(() => unref(mostLiked).map((label, i) => ({
            label,
            value: Math.pow(2, i).toString(),
          }))),
          required: false,
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
  | "overallComment"
  | "testimonial">;
export const companyApplicationFeedbackOverall =
  <T extends FeedbackOverall>(feedback?: T | null) =>
    ({
      recommended = [] as MaybeRef<string[]>,
    } = {}): Record<keyof FeedbackOverall, InputEntry> =>
      ({
        overallRating: {
          value: feedback?.overallRating ?? null,
          type: "number-range" as const,
          min: 1,
          max: 10,
        },
        recommended: {
          value: String(feedback?.recommended ?? ""),
          type: "single-pick" as const,
          options: computed(() => unref(recommended).map((label, i) => ({
            label,
            value: Math.pow(2, i).toString(),
          }))),
        },
        overallComment: {
          value: feedback?.overallComment || "",
          type: "textarea" as const,
          required: false,
        },
        testimonial: {
          value: feedback?.testimonial || "",
          type: "textarea" as const,
          required: false,
        },
      })
;
