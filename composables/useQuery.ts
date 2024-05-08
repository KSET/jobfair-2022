import {
  type DocumentNode,
} from "graphql";
import {
  unref,
} from "vue";
import {
  type TypedDocumentNode,
} from "@urql/core";
import {
  useNuxtApp,
} from "#app";
import {
  type MaybeRef,
} from "~/helpers/type";
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

export function useQuery<TData, TVars extends object>(
  {
    query,
    variables,
    context,
  }: {
    query: TypedDocumentNode<TData, TVars> | MaybeRef<Operation<TVars>["query"]>,
    variables?: MaybeRef<TVars>,
    context?: MaybeRef<{
      headers: Record<string, string>,
    }>,
  },
) {
  return (
    (variableOverrides?: MaybeRef<Partial<TVars>>) =>
      doQuery<TData, TVars>(
        unref(query),
        {
          variables: unref(reactive({ ...variables, ...variableOverrides }) as TVars),
          headers: unref(context)?.headers,
        },
      )
  );
}


type MutationExecutionOptions = {
  context: MaybeRef<QueryExecutionContext>,
};

export function useMutation<TData, TVars extends object>(
  query: TypedDocumentNode<TData, TVars> | Operation<TVars>["query"],
  opts?: Partial<MutationExecutionOptions>,
) {
  return (
    (
      variables?: MaybeRef<TVars>,
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
