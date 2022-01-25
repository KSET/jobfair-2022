<template>
  <app-textarea
    v-if="type === 'textarea'"
    v-model="info.descriptionEn"
    :class="$style.formElement"
    :disabled="isLoading"
    :invalid="errors.descriptionEn.length > 0"
    :options="industriesOptions"
    label-key="form.descriptionEn"
    name="descriptionEn"
    required
    type="text"
  >
    <template v-if="errors.descriptionEn.length > 0" #message>
      <translated-text
        v-for="err in errors.descriptionEn"
        :key="err.message"
        :trans-key="err.message"
        class="block"
      />
    </template>
  </app-textarea>
</template>

<script lang="ts">
  import {
    defineComponent,
  } from "vue";
  import AppTextarea from "~/components/util/form/app-textarea.vue";
  import TranslatedText from "~/components/TranslatedText.vue";

  export default defineComponent({
    components: {
      TranslatedText,
      AppTextarea,
    },

    inheritAttrs: false,

    props: {
      type: {
        required: true,
        type: String,
      },
    },
  });
</script>
