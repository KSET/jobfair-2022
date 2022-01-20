import {
  build,
  schemaPath,
} from "./app/graphql/schema/helpers";
import {
  SessionUser,
} from "./app/types/apollo-context";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Request {
      user: SessionUser | null,
    }
  }
}

// eslint-disable-next-line no-void
void (async () => {
  await build();
})().then(
  () =>
    // eslint-disable-next-line no-console
    console.log(`Schema dumped to \`${ schemaPath() }'`)
  ,
);
