import {
  z,
  type ZodType,
} from "zod";
import {
  type ZodTypeDef,
} from "zod/lib/types";

export const PASSWORD_LENGTH_MIN = 8 as const;
export const PASSWORD_LENGTH_MAX = 99 as const;

const passwordValidation = z.string().min(PASSWORD_LENGTH_MIN).max(PASSWORD_LENGTH_MAX);

const formatValidation =
  async <Output, Def extends ZodTypeDef = ZodTypeDef, Input = Output>(
    validationObject: ZodType<Output, Def, Input>,
    data: unknown,
  ): Promise<{ success: boolean, errors: { field: keyof Output, message: string, }[], }> => {
    const validation = await validationObject.safeParseAsync(data);

    if (validation.success) {
      return {
        success: true,
        errors: [],
      };
    }

    const errors = validation.error.errors.map((err) => ({
      field: err.path.join(".") as keyof Output,
      message: err.message,
    }));

    return {
      success: validation.success,
      errors,
    };
  }
;


const registerValidation = z.object({
  email: z.string().email().max(127),
  firstName: z.string().min(2).max(80),
  lastName: z.string().min(2).max(80),
  phone: z.string().min(4).max(80),
  language: z.optional(z.string()),
  password: passwordValidation,
  passwordRepeat: passwordValidation,
});
export const RegisterValidation = <T>(user: T) => formatValidation(registerValidation, user);


const profileValidation = registerValidation.omit({
  password: true,
  passwordRepeat: true,
});
export const ProfileValidation = <T>(user: T) => formatValidation(profileValidation, user);


const passwordUpdateValidation = z.object({
  newPassword: passwordValidation,
  newPasswordRepeat: passwordValidation,
});
export const PasswordUpdateValidation = <T>(update: T) => formatValidation(passwordUpdateValidation, update);


const companyValidation = z.object({
  legalName: z.string().min(1),
  brandName: z.string().min(1).max(100),
  address: z.string().min(1),
  descriptionEn: z.string().min(1).max(450),
  descriptionHr: z.string().min(1).max(450),
  website: z.string().url().min(1).max(100),
  industry: z.string().min(1),
});
export const CompanyValidation = <T>(company: T) => formatValidation(companyValidation, company);


const pressReleaseValidation = z.object({
  title: z.string().min(1),
  published: z.date(),
});
export const PressReleaseValidation = <T>(pressRelease: T) => formatValidation(pressReleaseValidation, pressRelease);

const companyPresenterValidation = z.object({
  firstName: z.string().min(2).max(80),
  lastName: z.string().min(2).max(80),
  bioEn: z.string().min(73).max(450),
  bioHr: z.optional(z.string().min(73).max(450)),
});
export const CompanyPresenterValidation = <T>(presenter: T) => formatValidation(companyTalkValidation, presenter);

const companyContactPersonValidation = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email().max(255),
  phone: z.string().min(4).max(80),
});
export const CompanyContactPersonValidation = <T>(contactPerson: T) => formatValidation(companyContactPersonValidation, contactPerson);

const companyTalkValidation = z.object({
  titleEn: z.string().min(1).max(75),
  titleHr: z.optional(z.string().min(1).max(75)),
  descriptionEn: z.string().min(73).max(450),
  descriptionHr: z.optional(z.string().min(73).max(450)),
  category: z.string(),
  language: z.string(),
  presenter: z.union([
    companyPresenterValidation,
    z.array(companyPresenterValidation),
  ]),
});
export const CompanyTalkValidation = <T>(talk: T) => formatValidation(companyTalkValidation, talk);

const companyWorkshopValidation = z.object({
  titleEn: z.string().min(1).max(75),
  titleHr: z.optional(z.string().min(1).max(75)),
  descriptionEn: z.string().min(73).max(450),
  descriptionHr: z.optional(z.string().min(73).max(450)),
  goal: z.string().min(1).max(450),
  language: z.string(),
  presenter: z.union([
    companyPresenterValidation,
    z.array(companyPresenterValidation),
  ]),
});
export const CompanyWorkshopValidation = <T>(workshop: T) => formatValidation(companyWorkshopValidation, workshop);

const companyCocktailValidation = z.object({
  name: z.string().min(1),
});
export const CompanyCocktailValidation = <T>(cocktail: T) => formatValidation(companyCocktailValidation, cocktail);

const companyApplicationValidation = z.object({
  contactPerson: companyContactPersonValidation,
  booth: z.nullable(z.string()),
  talk: z.nullable(companyTalkValidation),
  workshop: z.nullable(companyWorkshopValidation),
  wantsCocktail: z.boolean(),
  wantsPanel: z.boolean(),
});
export const CompanyApplicationValidation = <T>(application: T) => formatValidation(companyApplicationValidation, application);

const companyApplicationApprovedValidation = z.object({
  talk: z.nullable(companyTalkValidation),
  workshop: z.nullable(companyWorkshopValidation),
  cocktail: z.nullable(companyCocktailValidation),
  panel: z.array(companyPresenterValidation),
});
export const CompanyApplicationApprovedValidation = <T>(application: T) => formatValidation(companyApplicationApprovedValidation, application);

const resumeFacultyValidation = z.union([
  z.object({
    name: z.string().min(1),
    specialization: z.optional(z.string()),
    module: z.string().min(1),
  }),
  z.object({
    name: z.string().length(0),
    specialization: z.optional(z.string()),
    module: z.string().length(0),
  }),
]);
export const ResumeFacultyValidation = <T>(faculty: T) => formatValidation(resumeFacultyValidation, faculty);

const resumeTechnologyValidation = z.object({
  name: z.string().min(1),
});
export const ResumeTechnologyValidation = <T>(technology: T) => formatValidation(resumeTechnologyValidation, technology);

const resumeInterestValidation = z.object({
  name: z.string().min(1),
});
export const ResumeInterestValidation = <T>(technology: T) => formatValidation(resumeInterestValidation, technology);

const resumeWorkExperienceValidation = z.object({
  position: z.string().min(1),
  company: z.string().min(1),
  start: z.union([ z.date(), z.string() ]),
  until: z.union([ z.date(), z.string().min(1), z.null() ]),
});
export const ResumeWorkExperienceValidation = <T>(workExperience: T) => formatValidation(resumeWorkExperienceValidation, workExperience);

const resumeProjectValidation = z.object({
  position: z.string().min(1),
  project: z.string().min(1),
  start: z.union([ z.date(), z.string() ]),
  until: z.union([ z.date(), z.string().min(1), z.null() ]),
});
export const ResumeProjectValidation = <T>(workExperience: T) => formatValidation(resumeProjectValidation, workExperience);

const resumeVolunteerExperienceValidation = z.object({
  position: z.string().min(1),
  organisation: z.string().min(1),
  start: z.union([ z.date(), z.string() ]),
  until: z.union([ z.date(), z.string().min(1), z.null() ]),
});
export const ResumeVolunteerExperienceValidation = <T>(workExperience: T) => formatValidation(resumeVolunteerExperienceValidation, workExperience);

const resumeCvValidation = z.object({
  cv: z.any(),
});
export const ResumeCvValidation = <T>(cv: T) => formatValidation(resumeCvValidation, cv);

const resumeStudyYearsValidation = z.object({
  studyYear: z.number().gte(0).lte(6),
  studyType: z.string().min(1),
});
export const ResumeStudyYearsValidation = <T>(cv: T) => formatValidation(resumeStudyYearsValidation, cv);

const resumeValidation = z.object({
  pdf: z.optional(resumeCvValidation),
  studyYears: z.array(resumeStudyYearsValidation),
  faculty: resumeFacultyValidation,
  workExperiences: z.array(resumeWorkExperienceValidation),
  projects: z.array(resumeProjectValidation),
  volunteerExperiences: z.array(resumeVolunteerExperienceValidation),
  technologies: z.array(z.string().min(1)),
  interests: z.array(z.string().min(1)),
  city: z.union([
    z.string().min(1),
    z.string().length(0),
  ]),
});
export const ResumeValidation = <T>(resume: T) => formatValidation(resumeValidation, resume);

const newsValidation = z.object({
  lang: z.string().min(1),
  date: z.union([ z.date(), z.string().min(1) ]),
  title: z.string().min(1),
  description: z.string().min(1),
  content: z.string().min(1),
  photo: z.any(),
});
export const NewsValidation = <T>(news: T) => formatValidation(newsValidation, news);
