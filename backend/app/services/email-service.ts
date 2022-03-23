import {
  resolve,
} from "node:path";
import HtmlMinifier from "html-minifier";
import {
  Attachment as MailerAttachment,
  Options as MailerOptions,
} from "nodemailer/lib/mailer";
import {
  smtpTransport,
} from "../providers/email";
import {
  ITemplates,
  TemplateParameters,
  Templates,
} from "../providers/template";

const sendMail =
  async (
    to: string,
    subject: string,
    html: string,
    text: string,
    attachments: MailerAttachment[] = [],
  ): Promise<boolean> => {
    try {
      const message: MailerOptions = {
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
          ...attachments,
        ],
      };

      await smtpTransport.sendMail(message);

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
;

export class EmailService {
  public static sendMail<Template extends keyof ITemplates>(
    subject: string,
    to: string,
    template: {
      name: Template,
      parameters: TemplateParameters<Template>,
    },
  ) {
    return sendMail(
      to,
      subject,
      this.renderTemplate(
        template.name,
        template.parameters,
      ),
      `${ template.parameters.content.join("\n") }\n\nPozdrav,\n    Tvoj Job Fair tim`,
    );
  }

  private static renderTemplate<Template extends keyof ITemplates>(
    name: Template,
    parameters: TemplateParameters<Template>,
  ) {
    const rendered = Templates[name](parameters);

    return (
      HtmlMinifier.minify(
        rendered,
        {
          collapseInlineTagWhitespace: true,
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
        },
      )
    );
  }
}
