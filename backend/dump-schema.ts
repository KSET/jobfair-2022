import {
  build,
  schemaPath,
} from "./app/graphql/schema/helpers";
import {
  SessionUser,
} from "./app/types/apollo-context";

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Request {
      user: SessionUser | null,
    }
  }
}

void (async () => {
  await build();
})().then(
  () =>
    // eslint-disable-next-line no-console
    console.log(`Schema dumped to \`${ schemaPath() }'`)
  ,
);
