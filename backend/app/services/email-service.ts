import {
  resolve,
} from "node:path";
import HtmlMinifier from "html-minifier";
import {
  Address,
  Options as MailerOptions,
} from "nodemailer/lib/mailer";
import inlineCss from "inline-css";
import * as Sentry from "@sentry/node";
import {
  compile as compileHtmlToTextFn,
} from "html-to-text";
import {
  smtpTransport,
} from "../providers/email";
import {
  ITemplates,
  TemplateParameters,
  Templates,
} from "../providers/template";
import {
  Dict,
} from "../types/helpers";

type EmailTo = string | Address | (string | Address)[];

const asset =
  (...filePath: string[]) =>
    ({
      filename: filePath[filePath.length - 1],
      path: resolve(
        __dirname,
        "../",
        "templates",
        "email",
        "assets",
        ...filePath,
      ),
      cid: `${ filePath.join("_") }@jobfair.fer.unizg.hr`,
    })
;

const sendMail =
  (
    to: EmailTo,
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
          asset("jobfair-logo.png"),
          asset("sprites", "icon-fb.png"),
          asset("sprites", "icon-ig.png"),
          asset("sprites", "icon-in.png"),
          asset("sprites", "icon-location.png"),
          asset("sprites", "icon-mail.png"),
          asset("sprites", "icon-yt.png"),
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

const htmlToText = compileHtmlToTextFn({
  formatters: {
    "altText"(elem, walk, builder, formatOptions) {
      builder.openBlock({
        leadingLineBreaks: formatOptions.leadingLineBreaks || 0,
      });
      const text = (elem.attribs as Dict<string>)?.alt;
      builder.addInline(text || "");
      builder.closeBlock({
        trailingLineBreaks: formatOptions.trailingLineBreaks || 0,
      });
    },
  },
  selectors: [
    {
      selector: "img",
      format: "skip",
    },
    {
      selector: "#logo",
      format: "skip",
    },
    {
      selector: "a > img",
      format: "altText",
    },
  ],
  hideLinkHrefIfSameAsText: true,
});

export class EmailService {
  public static async sendMail<Template extends keyof ITemplates>(
    to: EmailTo,
    subject: string,
    template: {
      name: Template,
      parameters: TemplateParameters<Template>,
    },
    options: Partial<MailerOptions> = {},
  ) {
    const html = await this.renderTemplate(
      template.name,
      template.parameters,
    );
    const text = htmlToText(html);

    return sendMail(
      to,
      subject,
      html,
      text,
      options,
    );
  }

  private static async renderTemplate<Template extends keyof ITemplates>(
    name: Template,
    parameters: TemplateParameters<Template>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const rendered = Templates[name]({
      ...parameters,
      PUBLIC_URL: (process.env.PUBLIC_URL || "").replace(/\/$/, ""),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    const inlinedCss = await inlineCss(
      rendered,
      {
        url: process.env.PUBLIC_URL || "",
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
