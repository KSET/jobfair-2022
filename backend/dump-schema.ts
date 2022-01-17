import {
  build,
  schemaPath,
} from "./app/graphql/schema/helpers";

// eslint-disable-next-line no-void
void (async () => {
  await build();
})().then(
  () =>
    // eslint-disable-next-line no-console
    console.log(`Schema dumped to \`${ schemaPath() }'`)
  ,
);
