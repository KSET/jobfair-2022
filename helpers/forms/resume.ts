import {
  ConditionalPick,
  Primitive,
} from "type-fest";
import {
  InputEntry,
} from "~/components/util/form/app-formgroup.vue";
import {
  IResume,
  IResumeFaculty,
  IResumeProject,
  IResumeStudyYear,
  IResumeVolunteerExperience,
  IResumeWorkExperience,
} from "~/graphql/schema";
import {
  asDate,
  asOptionalDate,
  today,
  yesterday,
} from "~/helpers/date";

type Maybe<T> = T | null | undefined;

type ResumeCity = Pick<IResume,
  | "city">;
export const resumeCityCreate =
  <T extends ResumeCity>(resume: Maybe<T>): Record<keyof ResumeCity, InputEntry> =>
    ({
      city: {
        value: resume?.city || "",
        type: "text",
        placeholder: "Zagreb",
        required: false,
      },
    })
;


type ResumeCv = Pick<NonNullable<IResume["cv"]>,
  "url"
  | "name"
  | "mimeType">;
export const resumeCvCreate =
  <T extends ResumeCv>(cv: Maybe<T>): { cv: InputEntry, } =>
    ({
      cv: {
        value: cv?.url || "",
        fileName: cv?.name,
        fileType: cv?.mimeType,
        accept: "application/pdf",
        type: "file" as const,
        required: false,
        attrs: {
          clearable: true,
        },
      },
    })
;

type ResumeStudy = ConditionalPick<IResumeStudyYear, Primitive>;
export const resumeStudyCreate =
  <T extends ResumeStudy>(resume: Maybe<T>): Record<keyof ResumeStudy, InputEntry> =>
    ({
      studyType: {
        value: resume?.studyType || "",
        type: "text",
        placeholder: "Preddiplomski",
      },
      studyYear: {
        value: resume?.studyYear as number,
        type: "number",
        placeholder: "3",
        attrs: {
          min: "1",
          max: "6",
        },
      },
    })
;

type ResumeFaculty = ConditionalPick<IResumeFaculty, Primitive>;
export const resumeFacultyCreate =
  <T extends ResumeFaculty>(resume: Maybe<T>): Record<keyof Omit<ResumeFaculty, "specialization">, InputEntry> =>
    ({
      name: {
        value: resume?.name || "",
        type: "text",
        placeholder: "Fakultet elektrotehnike i računarstva",
        required: false,
      },
      module: {
        value: resume?.module || "",
        type: "text",
        placeholder: "Računarska znanost",
        required: false,
      },
    })
;

type ResumeWorkExperience = ConditionalPick<IResumeWorkExperience, Primitive>;
export const resumeWorkExperienceCreate =
  <T extends ResumeWorkExperience>(resume: Maybe<T>): Record<keyof ResumeWorkExperience, InputEntry> =>
    ({
      company: {
        value: resume?.company || "",
        type: "text",
        placeholder: "Elektrostudent d.o.o.",
      },
      position: {
        value: resume?.position || "",
        type: "text",
        placeholder: "Konobar",
      },
      start: {
        value: asDate(resume?.start, yesterday),
        type: "date",
        placeholder: asDate(yesterday()),
      },
      until: {
        value: asOptionalDate(resume?.until, () => ""),
        type: "date",
        placeholder: asDate(today()),
        required: false,
      },
    })
;

type ResumeProject = ConditionalPick<IResumeProject, Primitive>;
export const resumeProjectCreate =
  <T extends ResumeProject>(resume: Maybe<T>): Record<keyof ResumeProject, InputEntry> =>
    ({
      project: {
        value: resume?.project || "",
        type: "text",
        placeholder: "Job Fair website",
      },
      position: {
        value: resume?.position || "",
        type: "text",
        placeholder: "Team Lead",
      },
      start: {
        value: asDate(resume?.start, yesterday),
        type: "date",
        placeholder: asDate(yesterday()),
      },
      until: {
        value: asOptionalDate(resume?.until, () => ""),
        type: "date",
        placeholder: asDate(today()),
        required: false,
      },
    })
;

type ResumeVolunteerExperience = ConditionalPick<IResumeVolunteerExperience, Primitive>;
export const resumeVolunteerExperienceCreate =
  <T extends ResumeVolunteerExperience>(resume: Maybe<T>): Record<keyof ResumeVolunteerExperience, InputEntry> =>
    ({
      organisation: {
        value: resume?.organisation || "",
        type: "text",
        placeholder: "KSET",
      },
      position: {
        value: resume?.position || "",
        type: "text",
        placeholder: "Member of Design team",
      },
      start: {
        value: asDate(resume?.start, yesterday),
        type: "date",
        placeholder: asDate(yesterday()),
      },
      until: {
        value: asOptionalDate(resume?.until, () => ""),
        type: "date",
        placeholder: asDate(today()),
        required: false,
      },
    })
;

type ResumeTechnology = ConditionalPick<{ name: string, }, Primitive>;
export const resumeTechnologyCreate =
  <T extends ResumeTechnology>(resume: Maybe<T>): Record<keyof ResumeTechnology, InputEntry> =>
    ({
      name: {
        value: resume?.name || "",
        type: "text",
        placeholder: "Haskell",
      },
    })
;

type ResumeInterest = ConditionalPick<{ name: string, }, Primitive>;
export const resumeInterestCreate =
  <T extends ResumeInterest>(resume: Maybe<T>): Record<keyof ResumeInterest, InputEntry> =>
    ({
      name: {
        value: resume?.name || "",
        type: "text",
        placeholder: "Biking",
      },
    })
;
