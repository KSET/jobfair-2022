import {
  DocumentNode,
} from "graphql";
import {
  unref,
} from "vue";
import {
  TypedDocumentNode,
} from "@urql/core";
import {
  MaybeRef,
} from "~/helpers/type";
import {
  useNuxtApp,
} from "#app";
import {
  reactive,
} from "#imports";

type Query = string | DocumentNode | TypedDocumentNode;

type QueryExecutionContext = {
  headers: HeadersInit,
};

type Operation<TVars> = {
  query: Query,
  variables?: TVars,
};

type QueryCompositeOptions<TVars> = {
  query: MaybeRef<Operation<TVars>["query"]>,
  variables?: MaybeRef<TVars>,
  context?: MaybeRef<{
    headers: Record<string, string>,
  }>,
};

type QueryData<TVars> = {
  variables?: TVars,
  headers?: HeadersInit,
};

function doQuery<TData, TVars extends object>(
  query: Query,
  {
    variables,
  } = {} as QueryData<TVars>,
) {
  const nuxt = useNuxtApp();

  return (
    nuxt
      .$urql
      .query<TData, TVars | undefined>(query, variables)
      .toPromise()
      .catch(() => Promise.resolve(null))
  );
}

function doMutation<TData, TVars extends object>(
  query: Query,
  {
    variables,
  } = {} as QueryData<TVars>,
) {
  const nuxt = useNuxtApp();

  return (
    nuxt
      .$urql
      .mutation<TData, TVars | undefined>(query, variables)
      .toPromise()
      .catch(() => Promise.resolve(null))
  );
}

export function useQuery<TData, TVars extends object>(opts: QueryCompositeOptions<TVars>) {
  return (
    () =>
      doQuery<TData, TVars>(
        unref(opts.query),
        {
          variables: unref(reactive(opts.variables ?? {}) as TVars),
          headers: unref(opts.context)?.headers,
        },
      )
  );
}


type MutationExecutionOptions = {
  context: MaybeRef<QueryExecutionContext>,
};

export function useMutation<TData, TVars extends object>(query: Operation<TVars>["query"], opts?: Partial<MutationExecutionOptions>) {
  return (
    (
      variables?: QueryCompositeOptions<TVars>["variables"],
    ) =>
      doMutation<TData, TVars>(
        unref(query),
        {
          variables: unref(variables),
          headers: unref(opts?.context)?.headers,
        },
      )
  );
}
