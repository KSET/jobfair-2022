import {
  defineStore,
} from "pinia";
import {
  gql,
} from "@urql/core";
import {
  IResumeQuery,
  IResumeQueryVariables,
  Resume,
} from "~/graphql/schema";
import {
  useMutation,
  useQuery,
} from "~/composables/useQuery";

type DResume = NonNullable<IResumeQuery["resume"]> & { isFavourite: boolean, };

export const useResumeStore = defineStore(
  "resume",
  {
    state: () => ({
      resume: null as (null | DResume),
    }),

    actions: {
      async fetchResumeFor(uid: string) {
        const resp = await useQuery<IResumeQuery, IResumeQueryVariables>({
          query: Resume,
          variables: {
            uid,
          },
        })();

        const resume = resp?.data?.resume ?? null;

        if (!resume) {
          this.resume = null;
        } else {
          this.resume = {
            ...resume,
            isFavourite: resp?.data?.resumeIsFavourite ?? false,
          };
        }


        return this.resume;
      },
      async setFavourite(uid: string, isFavourite: boolean) {
        const resp = await useMutation<{ resumeSetIsFavourite: boolean, }, { uid: string, isFavourite: boolean, }>(gql`
            mutation ResumeSetIsFavourite($uid: String!, $isFavourite: Boolean!) {
                resumeSetIsFavourite(uid: $uid, isFavourite: $isFavourite)
            }
        `)({
          uid,
          isFavourite,
        });

        const data = resp?.data?.resumeSetIsFavourite ?? false;

        if (this.resume && data) {
          this.resume.isFavourite = isFavourite;
        }

        return data;
      },
    },
  },
);
