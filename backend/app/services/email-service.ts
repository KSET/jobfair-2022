import {
  resolve,
} from "node:path";
import HtmlMinifier from "html-minifier";
import {
  Options as MailerOptions,
} from "nodemailer/lib/mailer";
import inlineCss from "inline-css";
import * as Sentry from "@sentry/node";
import {
  smtpTransport,
} from "../providers/email";
import {
  ITemplates,
  TemplateParameters,
  Templates,
} from "../providers/template";

const sendMail =
  (
    to: string,
    subject: string,
    html: string,
    text: string,
    options: Partial<MailerOptions> = {},
  ) => {
    try {
      const message: MailerOptions = {
        ...options,
        from: `"${ process.env.EMAIL_FROM_NAME || "Job Fair" }" <${ process.env.EMAIL_FROM || "dontreply-jobfair@fer.hr" }>`,
        replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM || "jobfair@fer.hr",
        to,
        subject: `[Job Fair] ${ subject }`,
        text,
        html,
        attachments: [
          {
            filename: "jobfair-logo.png",
            path: resolve(
              __dirname,
              "../",
              "templates",
              "email",
              "assets",
              "jobfair-logo.png",
            ),
            cid: "jobfair-logo@jobfair.fer.unizg.hr",
          },
          ...(options.attachments ?? []),
        ],
      };

      return smtpTransport.sendMail(message);
    } catch (e) {
      Sentry.captureException(e);
      return null;
    }
  }
;

export class EmailService {
  public static async sendMail<Template extends keyof ITemplates>(
    to: string,
    subject: string,
    template: {
      name: Template,
      parameters: TemplateParameters<Template>,
    },
    options: Partial<MailerOptions> = {},
  ) {
    return sendMail(
      to,
      subject,
      await this.renderTemplate(
        template.name,
        template.parameters,
      ),
      `${ template.parameters.content.join("\n") }\n\nPozdrav,\nJob Fair Tim\nUnska 3, 10000 Zagreb, Hrvatska\ne-mail: jobfair@fer.hr\nweb: jobfair.fer.unizg.hr\nsocial: jobfairfer\n#jobfair22`,
      options,
    );
  }

  private static async renderTemplate<Template extends keyof ITemplates>(
    name: Template,
    parameters: TemplateParameters<Template>,
  ) {
    const rendered = Templates[name](parameters);
    const inlinedCss = await inlineCss(
      rendered,
      {
        url: "https://jobfair.fer.unizg.hr/",
        preserveMediaQueries: true,
        applyTableAttributes: true,
        removeHtmlSelectors: false,
      },
    );

    return (
      HtmlMinifier.minify(
        inlinedCss,
        {
          collapseInlineTagWhitespace: true,
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          minifyCSS: {
            level: 2,
          },
          sortAttributes: true,
        },
      )
    );
  }
}
