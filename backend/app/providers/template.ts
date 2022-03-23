import {
  readFileSync,
} from "node:fs";
import {
  resolve,
} from "node:path";
import Handlebars, {
  TemplateDelegate,
} from "handlebars";

const templatesDir =
  resolve(
    __dirname,
    "..",
    "templates",
  )
;

export const readTemplate =
  (...path: string[]) =>
    readFileSync(
      resolve(
        templatesDir,
        ...path.slice(0, -1),
        `${ path[path.length - 1] }.handlebars`,
      ),
      {
        encoding: "utf-8",
      },
    )
;

const template =
  <T>(...path: string[]): TemplateDelegate<T> =>
    Handlebars.compile<T>(
      readTemplate(
        ...path,
      ),
    )
;

Handlebars.registerPartial(
  "layout-default",
  readTemplate(
    "email",
    "layouts",
    "default",
  ),
);

export const Templates = {
  emailRegister: template<{
    content: string[],
  }>(
    "email",
    "register",
  ),
};

export type ITemplates = typeof Templates;

export type TemplateParameters<Template extends keyof ITemplates> =
  Parameters<ITemplates[Template]>[0]
  & {
    content: string[],
  }
  ;
