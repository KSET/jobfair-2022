import {
  DocumentNode,
} from "graphql";
import {
  MaybeRef,
} from "@vueuse/shared";
import {
  unref,
} from "vue";
import {
  TypedDocumentNode,
} from "@urql/core";
import {
  useCookie,
  useNuxtApp,
} from "#app";

type Query = string | DocumentNode | TypedDocumentNode;

type Headers = Record<string, string>;

type QueryExecutionContext = {
  headers: Headers,
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
  headers?: Headers,
};

function defaultQueryHeaders() {
  const headers: Headers = {
    "content-type": "application/json",
  };

  const sessionId = unref(useCookie("jobfair-session"));
  if (sessionId) {
    headers["x-session-id"] = sessionId;
  }

  return headers;
}

function doQuery<TData, TVars extends object>(
  query: Query,
  {
    variables,
    headers: argHeaders,
  } = {} as QueryData<TVars>,
) {
  const nuxt = useNuxtApp();

  return (
    nuxt
      .$urql
      .query<TData, TVars>(query, variables, {
        fetchOptions: {
          headers: {
            ...defaultQueryHeaders(),
            ...argHeaders,
          },
        },
      })
      .toPromise()
      .catch(() => Promise.resolve(null))
  );
}

function doMutation<TData, TVars extends object>(
  query: Query,
  {
    variables,
    headers: argHeaders,
  } = {} as QueryData<TVars>,
) {
  const nuxt = useNuxtApp();

  return (
    nuxt
      .$urql
      .mutation<TData, TVars>(query, variables, {
        fetchOptions: {
          headers: {
            ...defaultQueryHeaders(),
            ...argHeaders,
          },
        },
      })
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
          variables: unref(opts.variables),
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
      variables: QueryCompositeOptions<TVars>["variables"],
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
