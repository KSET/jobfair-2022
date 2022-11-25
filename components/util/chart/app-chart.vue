<template>
  <div class="p-chart">
    <canvas
      ref="canvasRef"
      :height="height"
      :width="width"
      @click="onCanvasClick($event)"
    />
  </div>
</template>

<script>
  /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
  import {
    onBeforeUnmount,
    onMounted,
  } from "vue";
  import {
    defineComponent,
    ref,
    watch,
  } from "#imports";

  export default defineComponent({
    name: "AppChart",

    props: {
      // eslint-disable-next-line vue/require-default-prop
      type: String,
      // eslint-disable-next-line vue/require-default-prop
      data: null,
      // eslint-disable-next-line vue/require-default-prop
      options: null,
      // eslint-disable-next-line vue/require-default-prop
      plugins: null,
      width: {
        type: Number,
        default: 300,
      },
      height: {
        type: Number,
        default: 150,
      },
    },

    emits: [ "select", "loaded" ],

    setup(props, { emit }) {
      /**
       * @type {Ref<Chart | null>}
       */
      const chart = ref(null);
      /**
       * @type {Ref<HTMLCanvasElement | null>}
       */
      const canvasRef = ref(null);

      const destroyChart = () => {
        const chartValue = chart.value;

        if (!chartValue) {
          return;
        }

        chartValue.destroy();
        chart.value = null;
      };

      const initChart = async () => {
        destroyChart();

        const Chart_ = await import("chart.js/auto");

        if (!Chart_?.default) {
          return;
        }

        const Chart = Chart_.default;

        chart.value = new Chart(canvasRef.value, {
          type: props.type,
          data: props.data,
          options: props.options,
          plugins: props.plugins,
        });

        emit("loaded", chart.value);
      };
      const reinit = () => initChart();

      watch(
        () => props.data,
        () => {
          void reinit();
        },
        {
          deep: true,
        },
      );

      watch(
        () => props.type,
        () => {
          void reinit();
        },
      );

      watch(
        () => props.options,
        () => {
          void reinit();
        },
      );

      onMounted(() => {
        void initChart();
      });

      onBeforeUnmount(() => {
        destroyChart();
      });

      return {
        canvasRef,
        onCanvasClick(event) {
          const chartValue = chart.value;
          if (!chartValue) {
            return;
          }

          const element = chartValue.getElementsAtEventForMode(event, "nearest", { intersect: true }, false);
          const dataset = chartValue.getElementsAtEventForMode(event, "dataset", { intersect: true }, false);

          if (!element?.[0] || !dataset) {
            return;
          }

          emit(
            "select",
            {
              originalEvent: event,
              element: element[0],
              dataset,
            },
          );
        },
      };
    },
  });
</script>

<style scoped>
  .p-chart {
    position: relative;
  }
</style>
