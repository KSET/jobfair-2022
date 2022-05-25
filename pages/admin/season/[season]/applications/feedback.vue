<template>
  <app-max-width-container :class="$style.container">
    <h1>Feedback</h1>

    <app-dropdown
      v-model="companyFilter"
      :options="companiesOptions"
      multiple
      name="feedbackFilter"
    />

    <div
      v-for="(keys, itemName) in items"
      :key="itemName"
      :class="$style.itemGroup"
    >
      <h2>
        <translated-text :trans-key="`company-feedback.form.${itemName}`" />
      </h2>
      <div v-for="key in keys" :key="key" :class="$style.item">
        <template v-if="key === 'mostLiked'">
          <strong>
            <translated-text :trans-key="`form.company-feedback.${key}`" />
          </strong>
          <ul>
            <li v-for="item in mostLiked" :key="item">
              <strong>
                <translated-text :trans-key="item" />
              </strong>:
              <span v-text="feedbackSummarized[key][item]" />
            </li>
          </ul>
        </template>
        <template v-else-if="key === 'recommended'">
          <strong>
            <translated-text :trans-key="`form.company-feedback.${key}`" />
          </strong>
          <ul>
            <li v-for="item in recommended" :key="item">
              <strong>
                <translated-text :trans-key="item" />
              </strong>:
              <span v-text="feedbackSummarized[key][item]" />
            </li>
          </ul>
        </template>
        <template v-else-if="key in feedbackSummarizedAvg">
          <span>
            <strong>
              <translated-text :trans-key="`form.company-feedback.${key}`" />
            </strong>: {{ feedbackSummarizedAvg[key].toFixed(2) }}
          </span>
          <client-only>
            <Chart
              :data="toGraphData(feedbackSummarized[key])"
              :height="280"
              :options="{ responsive: false }"
              :width="280"
              type="pie"
            />
          </client-only>
        </template>
        <template v-else>
          <span class="mb-3">
            <strong>
              <translated-text :trans-key="`form.company-feedback.${key}`" />
            </strong>
          </span>
          <div>
            <fieldset
              v-for="(item, uid) in feedbackSummarized[key]"
              :key="uid"
            >
              <legend>
                <strong v-text="item.name" />
              </legend>

              <p :class="$style.comment" v-text="item.text" />
            </fieldset>
          </div>
        </template>
      </div>
    </div>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    keys,
    sum,
  } from "rambdax";
  import {
    cloneDeepWith,
  } from "lodash-es";
  import Chart from "primevue/chart";
  import type {
    ChartData,
  } from "chart.js";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    computed,
    defineComponent,
    ref,
    unref,
    useQuery,
    useRoute,
  } from "#imports";
  import AppDropdown from "~/components/util/form/app-dropdown.vue";
  import {
    AdminFeedbackInfo,
    IAdminFeedbackInfoQuery,
    IAdminFeedbackInfoQueryVariables,
  } from "~/graphql/schema";
  import TranslatedText from "~/components/TranslatedText.vue";

  export default defineComponent({
    name: "PageAdminSeasonApplicationsFeedback",

    components: {
      TranslatedText,
      AppDropdown,
      AppMaxWidthContainer,
      Chart,
    },

    async setup() {
      const route = useRoute();

      const companyFilter = ref([] as string[]);

      const resp = await useQuery<IAdminFeedbackInfoQuery, IAdminFeedbackInfoQueryVariables>({
        query: AdminFeedbackInfo,
        variables: {
          seasonUid: route.params.season as string,
        },
      })().then((resp) => resp?.data);

      const mostLiked = [
        "form.company-feedback.experience.mostLiked.1",
        "form.company-feedback.experience.mostLiked.2",
        "form.company-feedback.experience.mostLiked.3",
        "form.company-feedback.experience.mostLiked.4",
        "form.company-feedback.experience.mostLiked.5",
        "form.company-feedback.experience.mostLiked.6",
        "form.company-feedback.experience.mostLiked.7",
      ];

      const recommended = [
        "form.company-feedback.overall.recommended.1",
        "form.company-feedback.overall.recommended.2",
        "form.company-feedback.overall.recommended.3",
      ];

      type Feedback = NonNullable<NonNullable<IAdminFeedbackInfoQuery["companyApplications"]>[0]["feedback"]>;

      const items: Record<string, (keyof Feedback)[]> = {
        date: [ "dateRating", "timeRating", "dateComments" ],
        organisation: [ "applicationRating", "onsiteRating", "foodRating", "applicationComments" ],
        experience: [ "attendanceRating", "mostLiked", "experienceComments" ],
        overall: [ "overallRating", "recommended", "overallComment", "testimonial" ],
      };

      const applications = (resp?.companyApplications || []).filter((x) => x.feedback);
      const companies = applications.map((app) => app.forCompany);

      const _bs = <T extends Record<keyof Omit<Feedback, "createdAt" | "updatedAt">, unknown>>(x: T) => x;
      const baseSummarized = _bs({
        applicationRating: [] as number[],
        attendanceRating: [] as number[],
        dateRating: [] as number[],
        foodRating: [] as number[],
        mostLiked: Object.fromEntries(mostLiked.map((x) => [ x, 0 ])),
        onsiteRating: [] as number[],
        overallRating: [] as number[],
        recommended: Object.fromEntries(recommended.map((x) => [ x, 0 ])),
        timeRating: [] as number[],
        dateComments: {} as Record<string, { text: string, name: string, }>,
        applicationComments: {} as Record<string, { text: string, name: string, }>,
        experienceComments: {} as Record<string, { text: string, name: string, }>,
        overallComment: {} as Record<string, { text: string, name: string, }>,
        testimonial: {} as Record<string, { text: string, name: string, }>,
      });
      const feedbackSummarized = computed(() => {
        const filterIds = unref(companyFilter);
        const filterItems = new Set(filterIds);
        const filtered =
          0 < filterIds.length
            ? applications.filter((app) => filterItems.has(app.forCompany!.uid))
            : applications
        ;

        return filtered.reduce(
          (acc, cur) => {
            const feedback = cur.feedback!;
            const company = cur.forCompany!;

            for (const key of keys(acc)) {
              switch (key) {
                case "mostLiked": {
                  const selected =
                    mostLiked
                      // eslint-disable-next-line no-bitwise
                      .map((_, i) => (feedback[key] ?? 0) & Math.pow(2, i))
                      .filter((x) => x)
                      .map((x) => mostLiked[Math.log2(x)])
                  ;

                  for (const selectedItem of selected) {
                    acc.mostLiked[selectedItem] += 1;
                  }

                  break;
                }
                case "recommended": {
                  const selected = recommended[Math.log2(feedback[key] ?? 0.5)];

                  if (selected) {
                    acc[key][selected] += 1;
                  }

                  break;
                }
                case "dateComments":
                case "applicationComments":
                case "experienceComments":
                case "overallComment":
                case "testimonial": {
                  if (!feedback[key]) {
                    break;
                  }

                  acc[key][company.uid] = {
                    text: feedback[key],
                    name: company.brandName,
                  };
                  break;
                }
                default: {
                  acc[key].push(feedback[key]);
                }
              }
            }

            return acc;
          },
          cloneDeepWith(baseSummarized),
        );
      });
      const feedbackSummarizedAvg = computed(() => {
        const data = unref(feedbackSummarized);

        return keys(data).reduce(
          (acc, key) => {
            const item = data[key];

            if (Array.isArray(item)) {
              acc[key] = sum(item) / item.length;
            }

            return acc;
          },
          {} as { [key: string]: number, },
        );
      });

      return {
        applications,
        companies,
        items,
        mostLiked,
        recommended,
        companiesOptions: companies.map((company) => ({
          label: company!.brandName,
          value: company!.uid,
        })),
        companyFilter,
        feedbackSummarized,
        feedbackSummarizedAvg,
        toGraphData(ratings: number[]) {
          const entries = ratings.reduce((acc, a) => ({ ...acc, [a]: (acc[a] ?? 0) + 1 }), {} as { [key: number]: number, });
          const labels = Object.keys(entries).map((x) => `Ocjena ${ x }`);
          const data = Object.values(entries);

          const colours = [
            "#f13c3c",
            "#ee5125",
            "#e86500",
            "#dd7700",
            "#cf8900",
            "#be9900",
            "#a9a700",
            "#90b500",
            "#71c100",
            "#42cc27",
          ];

          const backgroundColor = colours.filter((_, i) => labels.includes(String(i + 1)));

          return <ChartData<"pie", unknown>> {
            labels,
            datasets: [
              {
                data,
                backgroundColor,
              },
            ],
          };
        },
      };
    },
  });
</script>

<style lang="scss" module>
  .container {

    .itemGroup {
      display: flex;
      flex-wrap: wrap;
      margin-top: 2rem;
      padding: 1rem;
      border: 1px solid black;
      border-radius: 4px;
      gap: 1rem;

      h2 {
        width: 100%;
      }

      .item {
        display: flex;
        flex-direction: column;
        width: fit-content;
        padding: 1rem;
        border: 1px solid black;
        border-radius: 4px;

        > * {
          overflow: auto;
          max-height: 350px;
        }

        .comment {
          overflow: auto;
          white-space: pre-wrap;
          word-break: break-word;
        }
      }
    }
  }
</style>
