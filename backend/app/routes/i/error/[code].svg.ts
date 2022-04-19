import {
  resolve,
} from "node:path";
import {
  readFileSync,
} from "fs";
import {
  Router,
} from "../../../helpers/route";
import {
  Dict,
} from "../../../types/helpers";

const router = new Router();

const templatesDir = resolve(
  __dirname,
  "../",
  "../",
  "../",
  "templates",
);

const errorTemplatesDir = resolve(
  templatesDir,
  "error",
);

const errorTemplate =
  (name: string) =>
    readFileSync(
      resolve(
        errorTemplatesDir,
        name,
      ),
      "utf8",
    )
;

const errorTemplate404 = errorTemplate("code.svg");

router.getRaw("/", (req, res) => {
  const {
    code,
  } = req.params as Dict<string>;

  res.removeHeader("set-cookie");
  res.type("svg");
  res.header("cache-control", "max-age=31536000, public, immutable");
  res.send(errorTemplate404.replace(
    "{{code}}",
    code,
  ));
  return res.end();
});

export default router;
