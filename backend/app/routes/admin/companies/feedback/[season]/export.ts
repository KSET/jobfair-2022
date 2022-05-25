import ExcelJS from "exceljs";
import contentDisposition from "content-disposition";
import {
  AuthRouter,
} from "../../../../../helpers/route";
import {
  Role,
} from "../../../../../helpers/auth";
import {
  Dict,
} from "../../../../../types/helpers";
import {
  prisma,
} from "../../../../../providers/prisma";

const router = new AuthRouter({
  role: Role.Admin,
});

router.getRaw("/all.xlsx", async (req, res) => {
  const { season } = req.params as Dict<string>;
  const feedbacks = await prisma.companyApplicationFeedback.findMany({
    where: {
      forApplication: {
        forSeason: {
          uid: season,
        },
      },
    },
    include: {
      forApplication: {
        select: {
          forCompany: {
            select: {
              brandName: true,
              legalName: true,
            },
          },
        },
      },
    },
  });

  const mostLiked = [
    "form.company-feedback.experience.mostLiked.1",
    "form.company-feedback.experience.mostLiked.2",
    "form.company-feedback.experience.mostLiked.3",
    "form.company-feedback.experience.mostLiked.4",
    "form.company-feedback.experience.mostLiked.5",
    "form.company-feedback.experience.mostLiked.6",
    "form.company-feedback.experience.mostLiked.7",
  ];

  const recommended = [
    "form.company-feedback.overall.recommended.1",
    "form.company-feedback.overall.recommended.2",
    "form.company-feedback.overall.recommended.3",
  ];

  const translations = await prisma.translation.findMany({
    where: {
      key: {
        in: [
          ...mostLiked,
          ...recommended,
        ],
      },
      language: "hr_HR",
    },
    select: {
      key: true,
      value: true,
    },
  });
  const translationsMap = new Map(translations.map((t) => [ t.key, t.value ]));
  const $t = (key: string) => translationsMap.get(key) ?? key;

  const workbook = new ExcelJS.Workbook();

  {
    const worksheet = workbook.addWorksheet("Feedback");
    worksheet.columns = [
      { header: "Firma (legal)", key: "legalName" },
      { header: "Firma (brand)", key: "brandName" },
      { header: "Ocjena datum", key: "dateRating" },
      { header: "Ocjena vrijeme", key: "timeRating" },
      { header: "Komentar datum/vrijeme", key: "dateComments" },
      { header: "Ocjena prijave", key: "applicationRating" },
      { header: "Ocjena on-site", key: "onsiteRating" },
      { header: "Ocjena hrana", key: "foodRating" },
      { header: "Komentar prijava", key: "applicationComments" },
      { header: "Ocjena posjećenost", key: "attendanceRating" },
      { header: "Izbor Najviše sviđalo", key: "mostLiked" },
      { header: "Komentar doživljaj", key: "experienceComments" },
      { header: "Ocjena ukupno", key: "overallRating" },
      { header: "Izbor preporučeno", key: "recommended" },
      { header: "Komenar općenito", key: "overallComment" },
      { header: "Testimonial", key: "testimonial" },
    ];

    for (const feedback of feedbacks) {
      worksheet.addRow({
        legalName: feedback.forApplication.forCompany.legalName,
        brandName: feedback.forApplication.forCompany.brandName,
        dateRating: feedback.dateRating,
        timeRating: feedback.timeRating,
        dateComments: feedback.dateComments,
        applicationRating: feedback.applicationRating,
        onsiteRating: feedback.onsiteRating,
        foodRating: feedback.foodRating,
        applicationComments: feedback.applicationComments,
        attendanceRating: feedback.attendanceRating,
        mostLiked:
          mostLiked
            // eslint-disable-next-line no-bitwise
            .map((_, i) => (feedback.mostLiked) & Math.pow(2, i))
            .filter((x) => x)
            .map((x) => $t(mostLiked[Math.log2(x)]))
            .join(", "),
        experienceComments: feedback.experienceComments,
        overallRating: feedback.overallRating,
        recommended: $t(recommended[Math.log2(feedback.recommended)]),
        overallComment: feedback.overallComment,
        testimonial: feedback.testimonial,
      });
    }
  }

  res
    .header("content-type", "application/vnd.ms-excel")
    .header("cache-control", "no-cache")
    .header("pragma", "no-store, private, no-cache, max-age=0, must-revalidate")
    .header("expires", "-1")
    .header("content-disposition", contentDisposition("Feedback.xlsx"))
  ;

  try {
    await workbook.xlsx.write(res);
  } catch {
  }

  return res.end();
});

export default router;
