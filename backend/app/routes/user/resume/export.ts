import ExcelJS from "exceljs";
import contentDisposition from "content-disposition";
import cookie from "cookie";
import {
  AuthRouter,
} from "../../../helpers/route";
import {
  prisma,
} from "../../../providers/prisma";
import {
  hasAtLeastRole,
  Role,
} from "../../../helpers/auth";

const router = new AuthRouter();

router.use((req, res, next) => {
  const { user } = req;

  if (!user) {
    return res.sendStatus(403);
  }

  const canView =
    0 < user.companies.length
    || hasAtLeastRole(Role.Admin, user)
  ;

  if (!canView) {
    return res.sendStatus(403);
  }

  next();
});

enum ResumeFilters {
  All = "resume.list.all",
  Scanned = "resume.list.scanned",
  Favourites = "resume.list.favourites"
}

router.getRaw("/all.xlsx", async (req, res) => {
  const cookies = cookie.parse(req.headers.cookie || "");
  const lang = cookies["jobfair-lang"] || "hr_HR";
  const langIso = "hr_HR" === lang ? "hr-HR" : "en-US";
  const user = req.user!;

  const include = {
    interests: true,
    studyYears: true,
    technologies: true,
    workExperiences: true,
    projects: true,
    faculty: true,
    volunteerExperiences: true,
    user: true,
    cv: true,
  };

  const [
    allResumes,
    scannedResumes,
    favouriteResumes,
    translations,
  ] = await Promise.all([
    prisma.resume.findMany({
      include,
    }),
    prisma.scannedResume.findMany({
      where: {
        company: {
          uid: user.companies?.[0]?.uid || "",
        },
      },
      select: {
        resume: {
          include,
        },
      },
    }),
    prisma.favouriteResume.findMany({
      where: {
        company: {
          uid: user.companies?.[0]?.uid || "",
        },
      },
      select: {
        resume: {
          include,
        },
      },
    }),
    prisma.translation.findMany({
      where: {
        key: {
          in: [
            ...Object.values(ResumeFilters),
            "resume.name",
            "resume.city",
            "resume.phone",
            "resume.email",

            "resume.faculty.name",
            "resume.faculty.module",

            "resume.section.education",
            "resume.section.education.type",
            "resume.section.education.years",

            "resume.section.workExperiences",
            "resume.section.workExperiences.company",
            "resume.section.workExperiences.position",
            "resume.section.workExperiences.duration",

            "resume.section.projects",
            "resume.section.projects.project",
            "resume.section.projects.position",
            "resume.section.projects.duration",

            "resume.section.volunteerExperiences",
            "resume.section.volunteerExperiences.organisation",
            "resume.section.volunteerExperiences.position",
            "resume.section.volunteerExperiences.duration",

            "resume.section.technologies",

            "resume.section.interests",

            "resume.section.cv",
          ],
        },
        language: "hr_HR" === lang ? "hr_HR" : "en_US",
      },
      select: {
        key: true,
        value: true,
      },
    }),
  ]);

  const translationsMap = new Map(translations.map((t) => [ t.key, t.value ]));
  const $t = (key: string) => translationsMap.get(key) ?? key;

  const workbook = new ExcelJS.Workbook();

  const addResumePage = (
    filter: ResumeFilters,
    resumes: typeof allResumes,
  ) => {
    const worksheet = workbook.addWorksheet($t(filter));
    const MAX_STUDY_YEARS = Math.max(...resumes.map((x) => x.studyYears?.length || 0));
    const MAX_WORK_EXPERIENCES = Math.max(...resumes.map((x) => x.workExperiences?.length || 0));
    const MAX_PROJECTS = Math.max(...resumes.map((x) => x.projects?.length || 0));
    const MAX_VOLUNTEER_EXPERIENCES = Math.max(...resumes.map((x) => x.volunteerExperiences?.length || 0));

    worksheet.columns = [
      { header: $t("resume.name"), key: "name" },
      { header: $t("resume.city"), key: "city" },
      { header: $t("resume.phone"), key: "phone" },
      { header: $t("resume.email"), key: "email" },
      { header: $t("resume.faculty.name"), key: "facultyName" },
      { header: $t("resume.faculty.module"), key: "facultyModule" },
      ...Array.from({ length: MAX_STUDY_YEARS }, (_, i) => [
        { header: `${ $t("resume.section.education") } - ${ $t("resume.section.education.type") } ${ i + 1 }`, key: `studyYearsType${ i }` },
        { header: `${ $t("resume.section.education") } - ${ $t("resume.section.education.years") } ${ i + 1 }`, key: `studyYearsDuration${ i }` },
      ]).flat(),
      ...Array.from({ length: MAX_WORK_EXPERIENCES }, (_, i) => [
        { header: `${ $t("resume.section.workExperiences") } - ${ $t("resume.section.workExperiences.company") } ${ i + 1 }`, key: `workExperiencesCompany${ i }` },
        { header: `${ $t("resume.section.workExperiences") } - ${ $t("resume.section.workExperiences.position") } ${ i + 1 }`, key: `workExperiencesPosition${ i }` },
        { header: `${ $t("resume.section.workExperiences") } - ${ $t("resume.section.workExperiences.duration") } ${ i + 1 }`, key: `workExperiencesDuration${ i }` },
      ]).flat(),
      ...Array.from({ length: MAX_PROJECTS }, (_, i) => [
        { header: `${ $t("resume.section.projects") } - ${ $t("resume.section.projects.project") } ${ i + 1 }`, key: `projectsProject${ i }` },
        { header: `${ $t("resume.section.projects") } - ${ $t("resume.section.projects.position") } ${ i + 1 }`, key: `projectsPosition${ i }` },
        { header: `${ $t("resume.section.projects") } - ${ $t("resume.section.projects.duration") } ${ i + 1 }`, key: `projectsDuration${ i }` },
      ]).flat(),
      ...Array.from({ length: MAX_VOLUNTEER_EXPERIENCES }, (_, i) => [
        { header: `${ $t("resume.section.volunteerExperiences") } - ${ $t("resume.section.volunteerExperiences.organisation") } ${ i + 1 }`, key: `volunteerExperiencesOrganisation${ i }` },
        { header: `${ $t("resume.section.volunteerExperiences") } - ${ $t("resume.section.volunteerExperiences.position") } ${ i + 1 }`, key: `volunteerExperiencesPosition${ i }` },
        { header: `${ $t("resume.section.volunteerExperiences") } - ${ $t("resume.section.volunteerExperiences.duration") } ${ i + 1 }`, key: `volunteerExperiencesDuration${ i }` },
      ]).flat(),
      { header: $t("resume.section.technologies"), key: "technologies" },
      { header: $t("resume.section.interests"), key: "interests" },
      { header: $t("resume.section.cv"), key: "cv" },
    ];

    const $fDate = (start: Date | string, end: Date | string | undefined | null) => {
      const $f =
        (date: Date | string | undefined | null) =>
          date
            ? new Date(date).toLocaleDateString(langIso)
            : ""
      ;

      return `${ $f(start) } - ${ $f(end) }`;
    };

    const $fDur = <T extends { start: Date | string, until: Date | string | null | undefined, }>(x: T) => $fDate(x.start, x.until);

    for (const resume of resumes) {
      const {
        user: _user,
        volunteerExperiences,
        faculty,
        projects,
        workExperiences,
        technologies,
        studyYears,
        interests,
        city,
        cv,
      } = resume;
      const user = _user!;

      const row = worksheet.addRow({
        name: `${ user.firstName } ${ user.lastName }`,
        city: `${ city }`,
        phone: `${ user.phone }`,
        email: `${ user.email }`,
        facultyName: "",
        facultyModule: "",
        ...Object.fromEntries(
          Array.from({ length: MAX_STUDY_YEARS }, (_, i) => [
            [ `studyYearsType${ i }`, "" ],
            [ `studyYearsDuration${ i }`, "" ],
          ] as const).flat(),
        ),
        ...Object.fromEntries(
          Array.from({ length: MAX_WORK_EXPERIENCES }, (_, i) => [
            [ `workExperiencesCompany${ i }`, "" ],
            [ `workExperiencesPosition${ i }`, "" ],
            [ `workExperiencesDuration${ i }`, "" ],
          ] as const).flat(),
        ),
        ...Object.fromEntries(
          Array.from({ length: MAX_PROJECTS }, (_, i) => [
            [ `projectsProject${ i }`, "" ],
            [ `projectsPosition${ i }`, "" ],
            [ `projectsDuration${ i }`, "" ],
          ] as const).flat(),
        ),
        ...Object.fromEntries(
          Array.from({ length: MAX_VOLUNTEER_EXPERIENCES }, (_, i) => [
            [ `volunteerExperiencesOrganisation${ i }`, "" ],
            [ `volunteerExperiencesPosition${ i }`, "" ],
            [ `volunteerExperiencesDuration${ i }`, "" ],
          ] as const).flat(),
        ),
        technologies: "",
        interests: "",
        cv: "",
      });

      if (faculty) {
        row.getCell("facultyName").value = faculty.name;
        row.getCell("facultyModule").value = faculty.module;
      }

      if (studyYears) {
        studyYears.forEach((studyYear, i) => {
          row.getCell(`studyYearsType${ i }`).value = studyYear.studyType;
          row.getCell(`studyYearsDuration${ i }`).value = studyYear.studyYear;
        });
      }

      if (workExperiences) {
        workExperiences.forEach((item, i) => {
          row.getCell(`workExperiencesCompany${ i }`).value = item.company;
          row.getCell(`workExperiencesPosition${ i }`).value = item.position;
          row.getCell(`workExperiencesDuration${ i }`).value = $fDur(item);
        });
      }

      if (projects) {
        projects.forEach((item, i) => {
          row.getCell(`projectsProject${ i }`).value = item.project;
          row.getCell(`projectsPosition${ i }`).value = item.position;
          row.getCell(`projectsDuration${ i }`).value = $fDur(item);
        });
      }

      if (volunteerExperiences) {
        volunteerExperiences.forEach((item, i) => {
          row.getCell(`volunteerExperiencesOrganisation${ i }`).value = item.organisation;
          row.getCell(`volunteerExperiencesPosition${ i }`).value = item.position;
          row.getCell(`volunteerExperiencesDuration${ i }`).value = $fDur(item);
        });
      }

      if (technologies) {
        row.getCell("technologies").value = technologies.map((x) => x.name).join(", ");
      }

      if (interests) {
        row.getCell("interests").value = interests.map((x) => x.name).join(", ");
      }

      if (cv) {
        const url = `${ process.env.BASE_URL || "https://jobfair.fer.unizg.hr/api" }/file/${ cv.uid }`;
        row.getCell("cv").value = {
          text: url,
          hyperlink: url,
        };
      }
    }
  };

  addResumePage(ResumeFilters.All, allResumes);
  addResumePage(ResumeFilters.Scanned, scannedResumes.map((x) => x.resume));
  addResumePage(ResumeFilters.Favourites, favouriteResumes.map((x) => x.resume));

  res
    .header("content-type", "application/vnd.ms-excel")
    .header("cache-control", "no-cache")
    .header("pragma", "no-store, private, no-cache, max-age=0, must-revalidate")
    .header("expires", "-1")
    .header("content-disposition", contentDisposition(`Job Fair - Resumes (${ new Date().toLocaleString(langIso) }).xlsx`))
  ;

  try {
    await workbook.xlsx.write(res);
  } catch {
  }

  return res.end();
});

export default router;
