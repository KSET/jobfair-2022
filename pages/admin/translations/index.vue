<template>
  <app-max-width-container :class="$style.container">
    <h1>Prijevodi</h1>

    <p v-if="missingCount > 0">
      <strong>Nedostaje: {{ missingCount }}</strong>
    </p>

    <table style="width: 100%; table-layout: fixed;">
      <thead>
        <tr>
          <th>
            key
          </th>
          <th>
            HR
          </th>
          <th>
            EN
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <input v-model="newTranslation.key" placeholder="key" type="text">
          </td>
          <td>
            <textarea v-model="newTranslation.hr" placeholder="hr" />
          </td>
          <td>
            <textarea v-model="newTranslation.en" placeholder="en" />
            <input type="submit" value="Save" @click.prevent="createTranslation">
          </td>
        </tr>
        <tr
          v-for="key in orderedKeys"
          :key="key"
        >
          <td class="text-right">
            <strong v-text="key" />
          </td>
          <td>
            <div
              :class="$style.text"
              :contenteditable="!isLoading"
              :style="!translations[key].hr_HR ? [{
                borderColor: 'red',
              }] : undefined"
              @blur="saveTranslation(key, 'hr_HR', translations[key].hr_HR)"
              @input.capture="translations[key].hr_HR = $event.target.innerText"
              v-text="translations[key].hr_HR || ''"
            />
          </td>
          <td>
            <div
              :class="$style.text"
              :contenteditable="!isLoading"
              :style="!translations[key].en_US ? [{
                borderColor: 'red',
              }] : undefined"
              @blur="saveTranslation(key, 'en_US', translations[key].en_US)"
              @input.capture="translations[key].en_US = $event.target.innerText"
              v-text="translations[key].en_US || ''"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    reactive,
    ref,
    unref,
  } from "vue";
  import {
    gql,
  } from "@urql/core";
  import {
    pipe,
  } from "rambda";
  import {
    groupBy,
    keys,
    map,
    mapToObject,
  } from "rambdax";
  import {
    type MaybeRef,
  } from "~/helpers/type";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    useQuery,
  } from "~/composables/useQuery";
  import {
    type ITranslation,
  } from "~/graphql/schema";
  import {
    Language,
    useTranslationsStore,
  } from "~/store/translations";

  export default defineComponent({
    name: "PageAdminTranslationsHome",

    components: {
      AppMaxWidthContainer,
    },

    async setup() {
      const translationsStore = useTranslationsStore();

      type QTranslation = Pick<ITranslation, "key" | "value" | "language" | "updatedAt">;
      type QData = {
        translations: QTranslation[],
      };
      type QArgs = never;
      const resp = await useQuery<QData, QArgs>({
        query: gql`
            query {
                translations(orderBy: { key: desc }) {
                    key
                    value
                    language
                }
            }
        `,
      })();

      const transformTranslations: (t: QTranslation[]) => Record<QTranslation["key"], Record<QTranslation["language"], QTranslation["value"]>> =
        pipe(
          // @ts-ignore: Trust me bro lmao
          groupBy((t: QTranslation) => t.key),
          map(mapToObject((t: QTranslation) => ({ [t.language]: t.value }))),
          reactive,
        )
      ;

      const translations = transformTranslations(resp?.data?.translations || []);
      const isMissing = (key: string) => !translations[key]?.[Language.HR] || !translations[key]?.[Language.EN];
      const allKeys = Object.keys(translations);
      const orderedKeys = ref([
        ...allKeys.filter(isMissing),
        ...allKeys.filter((key) => !isMissing(key)),
      ]);
      const missingCount = computed(() => orderedKeys.value.filter(isMissing).length);
      const isLoading = ref(false);
      const newTranslation = reactive({
        key: "",
        hr: "",
        en: "",
      });
      const resetNewTranslation = () => keys(newTranslation).forEach((key) => newTranslation[key] = "");

      return {
        isLoading,
        translations,
        orderedKeys,
        missingCount,
        newTranslation,
        async saveTranslation(key: string, language: Language, value: MaybeRef<string>) {
          const oldValue = translationsStore.translation(key, language);

          if (oldValue === value || !value) {
            return;
          }

          try {
            isLoading.value = true;
            await translationsStore.updateTranslation({
              key,
              language,
              value: unref(value),
            });
            await translationsStore.fetchTranslations();
          } catch {
            alert("Something went wrong");
          } finally {
            isLoading.value = false;
          }
        },
        async createTranslation() {
          const {
            key,
            hr,
            en,
          } = newTranslation;

          try {
            isLoading.value = true;
            await Promise.all([
              translationsStore.updateTranslation({
                key,
                language: Language.HR,
                value: hr,
              }),
              translationsStore.updateTranslation({
                key,
                language: Language.EN,
                value: en,
              }),
            ]);
            translations[key] = {
              [Language.HR]: hr,
              [Language.EN]: en,
            };
            if (!orderedKeys.value.includes(key)) {
              orderedKeys.value.unshift(key);
            }
            await translationsStore.fetchTranslations();
            resetNewTranslation();
          } catch {
            alert("Something went wrong");
          } finally {
            isLoading.value = false;
          }
        },
      };
    },
  });
</script>

<style lang="scss" module>
  .container {

    tr > td:first-child,
    tr > th:first-child {
      width: 250px;
      word-break: break-word;
    }

    .text {
      width: 100%;
      padding: .2rem;
      white-space: pre-wrap;
      word-break: break-word;
      border: 2px dashed;
    }
  }
</style>
