<template>
  <app-max-width-container :class="$style.container">
    <div :class="$style.header">
      <span>
        <nuxt-link
          :to="{ name: 'profile-me-company-resumes' }"
        >
          <translated-text trans-key="profile.company.resumes" />
        </nuxt-link>
        / <strong>{{ resume.user.name }}</strong>
      </span>

      <span class="ml-auto">
        <p-button
          class="p-button-text"
          :loading="favouriteLoading"
          @click="handleFavourite"
        >
          <i
            :class="[
              resume.isFavourite ? 'pi-heart-fill' : 'pi-heart',
            ]"
            class="pi p-button-icon p-button-icon-left"
          />
          <span class="p-button-label">
            <translated-text v-if="resume.isFavourite" trans-key="resume.favourite.remove" />
            <translated-text v-else trans-key="resume.favourite.add" />
          </span>
        </p-button>
      </span>
    </div>

    <div :class="$style.section">
      <h2>
        <translated-text trans-key="resume.section.basic-info" />
      </h2>
      <div :class="$style.basicInfo">
        <div :class="$style.basicInfoItem">
          <translated-text trans-key="resume.name" />
          <span v-text="resume.user.name" />
        </div>
        <div v-if="resume.city" :class="$style.basicInfoItem">
          <translated-text trans-key="resume.city" />
          <span v-text="resume.city" />
        </div>
        <div v-if="resume.user.phone" :class="$style.basicInfoItem">
          <translated-text trans-key="resume.phone" />
          <span v-text="resume.user.phone" />
        </div>
        <div :class="$style.basicInfoItem">
          <translated-text trans-key="resume.email" />
          <span v-text="resume.user.email" />
        </div>
      </div>
    </div>

    <div v-if="resume.studyYears && resume.studyYears.length > 0" :class="$style.section">
      <h2>
        <translated-text trans-key="resume.section.education" />
      </h2>
      <DataTable :value="resume.studyYears">
        <Column :header="tt('resume.section.education.type')" field="studyType" />
        <Column :header="tt('resume.section.education.years')" field="studyYear" />
      </DataTable>
    </div>

    <div v-if="resume.workExperiences && resume.workExperiences.length > 0" :class="$style.section">
      <h2>
        <translated-text trans-key="resume.section.workExperiences" />
      </h2>
      <DataTable :value="resume.workExperiences">
        <Column :header="tt('resume.section.workExperiences.company')" field="company" />
        <Column :header="tt('resume.section.workExperiences.position')" field="position" />
        <Column :header="tt('resume.section.workExperiences.duration')">
          <template #body="{ data }">
            <AppDate :time="data.start" />
            -
            <AppDate v-if="data.until" :time="data.until" />
          </template>
        </Column>
      </DataTable>
    </div>

    <div v-if="resume.projects && resume.projects.length > 0" :class="$style.section">
      <h2>
        <translated-text trans-key="resume.section.projects" />
      </h2>
      <DataTable :value="resume.projects">
        <Column :header="tt('resume.section.projects.project')" field="project" />
        <Column :header="tt('resume.section.projects.position')" field="position" />
        <Column :header="tt('resume.section.projects.duration')">
          <template #body="{ data }">
            <AppDate :time="data.start" />
            -
            <AppDate v-if="data.until" :time="data.until" />
          </template>
        </Column>
      </DataTable>
    </div>

    <div v-if="resume.volunteerExperiences && resume.volunteerExperiences.length > 0" :class="$style.section">
      <h2>
        <translated-text trans-key="resume.section.volunteerExperiences" />
      </h2>
      <DataTable :value="resume.volunteerExperiences">
        <Column :header="tt('resume.section.volunteerExperiences.organisation')" field="organisation" />
        <Column :header="tt('resume.section.volunteerExperiences.position')" field="position" />
        <Column :header="tt('resume.section.volunteerExperiences.duration')">
          <template #body="{ data }">
            <AppDate :time="data.start" />
            -
            <AppDate v-if="data.until" :time="data.until" />
          </template>
        </Column>
      </DataTable>
    </div>

    <div v-if="resume.technologies && resume.technologies.length > 0" :class="$style.section">
      <h2>
        <translated-text trans-key="resume.section.technologies" />
      </h2>
      <div :class="$style.interests">
        <div
          v-for="technology in resume.technologies"
          :key="technology"
          :class="$style.interest"
          v-text="technology"
        />
      </div>
    </div>

    <div v-if="resume.interests && resume.interests.length > 0" :class="$style.section">
      <h2>
        <translated-text trans-key="resume.section.interests" />
      </h2>
      <div :class="$style.interests">
        <div
          v-for="interest in resume.interests"
          :key="interest"
          :class="$style.interest"
          v-text="interest"
        />
      </div>
    </div>

    <div v-if="resume.cv" :class="$style.section">
      <h2>
        <translated-text trans-key="resume.section.cv" />
      </h2>

      <a :class="$style.cvDownload" :href="resume.cv.url">
        <p-button class="p-button-text">
          <i class="pi pi-download p-button-icon p-button-icon-left" />
          <span class="p-button-label">
            <translated-text trans-key="resume.section.cv.download" />
          </span>
        </p-button>
      </a>
    </div>
  </app-max-width-container>
</template>

<script lang="ts">
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import {
    computed,
    defineComponent,
    ref,
  } from "#imports";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    useResumeStore,
  } from "~/store/resume";
  import TranslatedText from "~/components/TranslatedText.vue";
  import {
    useTranslationsStore,
  } from "~/store/translations";
  import AppDate from "~/components/util/app-date.vue";

  export default defineComponent({
    name: "PageResume",

    components: {
      AppDate,
      TranslatedText,
      AppMaxWidthContainer,
      DataTable,
      Column,
    },

    setup() {
      const resumeStore = useResumeStore();
      const translationsStore = useTranslationsStore();
      const favouriteLoading = ref(false);

      return {
        favouriteLoading,
        resume: computed(() => resumeStore.resume!),
        tt: translationsStore.translation,
        async handleFavourite() {
          favouriteLoading.value = true;
          const resume = resumeStore.resume!;
          await resumeStore.setFavourite(resume.uid, !resume.isFavourite);
          favouriteLoading.value = false;
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .container {

    .header {
      display: flex;
      margin-top: 1.625rem;
      margin-bottom: 2.5rem;
      color: $fer-dark-blue;

      a {
        opacity: .7;
        color: $fer-dark-blue;
      }

      @include media(md) {
        flex-direction: column;
        gap: 1rem;
      }
    }

    .section {

      h2 {
        font-size: 1.375rem;
        display: flex;
        padding-bottom: .6rem;
        color: $fer-dark-blue;
        border-bottom: 1px solid rgb(0 0 0 / 50%);
      }

      :global(.p-column-title) {
        // text-transform: uppercase;
        opacity: .6;
      }
    }

    .section + .section {
      margin-top: 5.5rem;

      @include media(md) {
        margin-top: 4rem;
      }
    }

    .basicInfo {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      .basicInfoItem {
        display: grid;
        grid-template-columns: 12.5rem auto;

        @include media(md) {
          grid-template-columns: minmax(0, 1fr);
          grid-row-gap: .5em;
        }

        > * {
          opacity: .8;
        }

        > *:first-child {
          font-weight: bold;
          text-transform: uppercase;
          opacity: .6;
        }
      }
    }

    .interests {
      display: flex;
      flex-direction: column;
      gap: .5rem;

      .interest {
        opacity: .8;
        color: $fer-black;
      }
    }

    .cvDownload {
      font-size: .875rem;
    }
  }
</style>
