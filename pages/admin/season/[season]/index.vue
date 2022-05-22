<template>
  <app-max-width-container :class="$style.container">
    <h1>Uredi <em v-text="season.name" /></h1>
    <div>
      <nuxt-link
        :to="{ name: 'admin' }"
      >
        &larr; Back
      </nuxt-link>
    </div>
    <div>
      <h1>Sponzori</h1>
      <client-only>
        <TransitionGroup :class="$style.sponsors" name="smooth-list" tag="div">
          <edit-sponsor
            key="new"
            :class="$style.sponsorForm"
            :loading="isLoading"
            :season-uid="season.uid"
            @delete="handleUpdateSponsors"
            @save="handleUpdateSponsors"
          />

          <edit-sponsor
            v-for="sponsor in sponsors"
            :key="sponsor.uid"
            :class="$style.sponsorForm"
            :is-first="sponsor === sponsors[0]"
            :is-last="sponsor === sponsors[sponsors.length - 1]"
            :loading="isLoading"
            :season-uid="season.uid"
            :sponsor="sponsor"
            @delete="handleUpdateSponsors"
            @move="handleMoveSponsor(sponsor, $event)"
            @save="handleUpdateSponsors"
          />
        </TransitionGroup>
      </client-only>
    </div>

    <div>
      <h1>Partneri</h1>
      <client-only>
        <TransitionGroup :class="$style.sponsors" name="smooth-list" tag="div">
          <edit-partner
            key="new"
            :class="$style.sponsorForm"
            :loading="isLoading"
            :season-uid="season.uid"
            @delete="handleUpdatePartners"
            @save="handleUpdatePartners"
          />

          <edit-partner
            v-for="partner in partners"
            :key="partner.uid"
            :class="$style.sponsorForm"
            :is-first="partner === partners[0]"
            :is-last="partner === partners[partners.length - 1]"
            :loading="isLoading"
            :partner="partner"
            :season-uid="season.uid"
            @delete="handleUpdatePartners"
            @move="handleMovePartner(partner, $event)"
            @save="handleUpdatePartners"
          />
        </TransitionGroup>
      </client-only>
    </div>
    <div class="mt-5">
      <nuxt-link
        :to="{ name: 'admin', hash: '#asdf' }"
      >
        &larr; Back
      </nuxt-link>
    </div>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    ref,
    unref,
  } from "vue";
  import {
    gql,
  } from "@urql/core";
  import {
    MaybeRef,
  } from "~/helpers/type";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    useSeasonsStore,
  } from "~/store/seasons";
  import {
    useQuery,
    useMutation,
  } from "~/composables/useQuery";
  import {
    IMutationSwapPartnerOrderArgs,
    IMutationSwapSponsorOrderArgs,
    IPartner,
    ISponsor,
  } from "~/graphql/schema";
  import EditSponsor from "~/components/page/admin/season/[season]/edit-sponsor.vue";
  import EditPartner from "~/components/page/admin/season/[season]/edit-partner.vue";

  export default defineComponent({
    name: "PageAdminSeasonHome",

    components: {
      EditPartner,
      EditSponsor,
      AppMaxWidthContainer,
    },

    async setup() {
      const seasonsStore = useSeasonsStore();
      const isLoading = ref(false);

      type QData = {
        partners: IPartner[],
        sponsors: ISponsor[],
      };
      type QVars = {
        season: string | undefined | null,
      };
      const resp = await useQuery<QData, QVars>({
        query: gql`
            query Data($season: String) {
                partners(season: $season) {
                    uid
                    name
                    url
                    order
                    photo {
                      uid
                      name
                      full {
                        mimeType
                      }
                    }
                }

                sponsors(season: $season) {
                    uid
                    name
                    url
                    order
                    photo {
                      uid
                      name
                      full {
                        mimeType
                      }
                    }
                }
            }
        `,
        variables: {
          season: seasonsStore.season?.uid,
        },
      })().then((resp) => resp?.data || null);

      const SponsorsQuery = useQuery<{ sponsors: ISponsor[], }, { season: string | null | undefined, }>({
        query: gql`
            query Data($season: String) {
                sponsors(season: $season) {
                    uid
                    name
                    url
                    order
                    photo {
                      uid
                      name
                      full {
                        mimeType
                      }
                    }
                }
            }
            `,
        variables: {
          season: seasonsStore.season?.uid,
        },
      });

      const PartnersQuery = useQuery<{ partners: IPartner[], }, { season: string | null | undefined, }>({
        query: gql`
            query Data($season: String) {
                partners(season: $season) {
                    uid
                    name
                    url
                    order
                    photo {
                      uid
                      name
                      full {
                        mimeType
                      }
                    }
                }
            }
            `,
        variables: {
          season: seasonsStore.season?.uid,
        },
      });

      const partners = ref(resp?.partners || []);
      const sponsors = ref(resp?.sponsors || []);

      const refreshSponsors = async () => {
        const resp = await SponsorsQuery().then((resp) => resp?.data || null);
        sponsors.value = resp?.sponsors || [];
      };

      const refreshPartners = async () => {
        const resp = await PartnersQuery().then((resp) => resp?.data || null);
        partners.value = resp?.partners || [];
      };

      const ordered =
        <T extends { order: number, }>(xs: MaybeRef<T[]>) =>
          [ ...unref(xs) ].sort((a, b) => a.order - b.order)
      ;

      return {
        season: computed(() => seasonsStore.season),
        partners: computed(() => ordered(partners)),
        sponsors: computed(() => ordered(sponsors)),
        isLoading,
        async handleUpdateSponsors() {
          await refreshSponsors();
        },
        async handleUpdatePartners() {
          await refreshPartners();
        },
        async handleMoveSponsor(sponsor: ISponsor, direction: string) {
          const offset = "left" === direction ? -1 : 1;
          const newOrder = sponsor.order + offset;
          const toSwapWith = sponsors.value.find((s) => s.order === newOrder);

          if (!toSwapWith) {
            return;
          }

          isLoading.value = true;
          await useMutation<boolean, IMutationSwapSponsorOrderArgs>(
            gql`
                mutation SwapSponsorOrder($season: String!, $orderA: Int!, $orderB: Int!) {
                    swapSponsorOrder(season: $season, orderA: $orderA, orderB: $orderB)
                }
            `,
          )({
            orderA: sponsor.order,
            orderB: newOrder,
            season: seasonsStore.season!.uid || "",
          });
          await refreshSponsors();
          isLoading.value = false;
        },
        async handleMovePartner(partner: IPartner, direction: string) {
          const offset = "left" === direction ? -1 : 1;
          const newOrder = partner.order + offset;
          const toSwapWith = partners.value.find((s) => s.order === newOrder);

          if (!toSwapWith) {
            return;
          }

          isLoading.value = true;
          await useMutation<boolean, IMutationSwapPartnerOrderArgs>(
            gql`
                mutation SwapPartnerOrder($season: String!, $orderA: Int!, $orderB: Int!) {
                    swapPartnerOrder(season: $season, orderA: $orderA, orderB: $orderB)
                }
            `,
          )({
            orderA: partner.order,
            orderB: newOrder,
            season: seasonsStore.season!.uid || "",
          });
          await refreshPartners();
          isLoading.value = false;
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  :global(.smooth-list-move),
  :global(.smooth-list-enter-active),
  :global(.smooth-list-leave-active) {
    transition: all .3s #{$transition-timing-function};
  }

  :global(.smooth-list-enter-from),
  :global(.smooth-list-leave-to) {
    transform: scaleY(.01) translate(30px, 0);
    opacity: 0;
  }

  :global(.smooth-list-leave-active) {
    position: absolute;
  }

  .container {

    > div > a {
      color: $fer-dark-blue;

      &:hover {
        text-decoration: underline;
      }
    }

    .sponsors {
      position: relative;
      display: grid;
      gap: .5rem;
      grid-template-columns: repeat(3, minmax(0, 1fr));

      @include media(sm) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .sponsorForm {
        font-size: .8rem;
      }
    }
  }
</style>
