<template>
  <AppMaxWidthContainer :class="$style.container">
    <h1>Novosti</h1>

    <div>
      <NuxtLink
        :to="{ name: 'admin' }"
      >
        &larr; Natrag
      </NuxtLink>
    </div>

    <div :class="$style.topActions">
      <NuxtLink
        :to="{ name: 'admin-news-new' }"
      >
        <PButton>
          New
        </PButton>
      </NuxtLink>
    </div>

    <AppTransitionFadeSmooth group :class="$style.news">
      <div
        v-for="item in news"
        :key="item.uid"
        :class="$style.newsItem"
      >
        <div
          :class="$style.newsItemLanguage"
          v-text="item.langReadable"
        />

        <NewsCard
          :class="$style.newsCard"
          :news-item="item"
          no-box-shadow
          square
        />

        <div :class="$style.newsItemActions">
          <PButton
            :loading="isLoading"
            class="p-button-danger"
            @click="handleDelete(item)"
          >
            Delete
          </PButton>

          <NuxtLink
            :style="{ marginLeft: 'auto' }"
            :to="{
              name: 'admin-news-uid-edit',
              params: {
                uid: item.uid,
              },
            }"
          >
            <PButton
              :loading="isLoading"
            >
              Edit
            </PButton>
          </NuxtLink>
        </div>
      </div>
    </AppTransitionFadeSmooth>
  </AppMaxWidthContainer>
</template>

<script lang="ts">
  import Button from "primevue/button";
  import useTitle from "~/composables/useTitle";
  import {
    AllNews,
    DeleteNews,
    IAllNewsQuery,
    IAllNewsQueryVariables,
    IDeleteNewsMutation,
    IDeleteNewsMutationVariables,
  } from "~/graphql/schema";
  import {
    useMutation,
    useQuery,
  } from "~/composables/useQuery";
  import {
    Language,
    LanguageToName,
  } from "~/store/translations";
  import {
    defineComponent,
    ref,
  } from "#imports";
  import AppTransitionFadeSmooth from "~/components/util/app-transition-fade-smooth.vue";

  export default defineComponent({
    name: "PageAdminNewsNew",

    components: {
      AppTransitionFadeSmooth,
      PButton: Button,
    },

    async setup() {
      useTitle("Admin | Novosti", false);

      const isLoading = ref(false);

      const fetchNews =
        () =>
          useQuery<IAllNewsQuery, IAllNewsQueryVariables>({
            query: AllNews,
          })()
            .then((res) => res?.data?.allNews ?? [])
            .then(
              (news) =>
                news
                  .map((item) => ({
                    ...item,
                    date: new Date(item.date as string),
                    langReadable: LanguageToName[item.lang as Language],
                  }))
                  .sort((lt, gt) => gt.date.getTime() - lt.date.getTime())
              ,
            )
      ;

      const news_ = await fetchNews();
      type QNews = (typeof news_)[0];
      const news = ref(news_);

      return {
        news,
        isLoading,
        handleDelete: async (item: QNews) => {
          if (!window.confirm(`Delete \`${ item.title }'?`)) {
            return;
          }

          isLoading.value = true;

          const resp = await useMutation<IDeleteNewsMutation, IDeleteNewsMutationVariables>(DeleteNews)({
            uid: item.uid,
          }).then((res) => res?.data?.deleteNews ?? false);

          if (!resp) {
            alert("Failed to delete news item.");
          }
          news.value = await fetchNews();

          isLoading.value = false;
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:map";
  @import "assets/styles/include";

  .container {

    .topActions {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 1rem;
    }

    .news {
      display: grid;
      gap: 1em;
      grid-template-columns: repeat(3, minmax(300px, 1fr));

      @include media(md) {
        grid-template-columns: repeat(2, minmax(300px, 1fr));
      }

      @include media(sm) {
        grid-template-columns: repeat(1, minmax(300px, 1fr));
      }

      .newsItem {
        position: relative;
        display: flex;
        overflow: hidden;
        flex-direction: column;
        border-radius: 4px;
        box-shadow: #{map.get($shadows, "shadow-3")};
        gap: .5em;

        > * + * {
          padding-top: 0 !important;
        }

        .newsCard {
          flex: 1;
        }

        .newsItemActions {
          display: flex;
          justify-content: flex-start;
          padding: .5em;
          gap: .5em;
        }

        .newsItemLanguage {
          font-weight: bold;
          position: absolute;
          z-index: 9;
          top: .5em;
          left: .5em;
          padding: .25em .45em;
          color: $fer-dark-blue;
          border-radius: 4px;
          background: $fer-white;
          box-shadow: #{map.get($shadows, "shadow-2")};
        }
      }
    }
  }
</style>
