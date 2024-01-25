<template>
  <div :class="$style.container">
    <div v-if="!isReady" :class="$style.loadingContainer">
      <h1>
        Loading...
      </h1>
    </div>
    <video
      ref="vid$"
    />
    <div v-if="isReady" :class="$style.widgets">
      <template v-if="!settings.flash.has">
        <label class="block">
          Flash:
          <p-button
            class="p-button-sm"
            :loading="settings.flash.loading"
            @click="handleFlashToggle"
          >
            {{ settings.flash.on ? "On" : "Off" }}
          </p-button>
        </label>
      </template>
      <label class="block mt-2">
        Camera:
        <select @change="handleCameraChange($event.target?.value)">
          <option value="">Change camera</option>
          <option
            v-for="camera in settings.cameras"
            :key="camera.id"
            :value="camera.id"
            v-text="camera.label"
          />
        </select>
      </label>
      <p>
        <label>
          Event:
          <Dropdown
            v-model="selectedEvent"
            :options="eventList.data.value ?? []"
            filter
            placeholder="Event"
            option-label="title"
            :loading="eventList.pending.value"
            :panel-class="$style.eventDropdown"
          >
            <template #option="{ option: item }">
              <div :class="$style.dropdownItem">
                <span :class="$style.dropdownItemType" v-text="item.type" />
                <span :class="$style.dropdownItemTitle" v-text="item.title" />
              </div>
            </template>
          </Dropdown>
        </label>
      </p>
    </div>
    <LazyClientOnly>
      <PDialog v-model:visible="resumeBool" @hide="handleModalClose">
        <h3 v-text="scanResult!.user.name" />
        <h3 v-text="scanResult!.user.phone" />

        <p v-if="scanResult!.hasReservation" :class="$style.reservationHas">
          Ima rezervaciju
        </p>
        <p v-else :class="$style.reservationHasNot">
          Nema rezervaciju
        </p>

        <p v-if="scanResult!.alreadyScanned" :class="$style.reservationAlreadyScanned">
          Već je skeniran!
        </p>

        <template #footer>
          <p-button label="OK" icon="pi pi-times" class="p-button-text" @click="handleModalClose" />
        </template>
      </PDialog>
    </LazyClientOnly>
  </div>
</template>
<script lang="ts">
  import {
    useToast,
  } from "primevue/usetoast";
  import QrScanner from "qr-scanner";
  import {
    throttle,
  } from "rambdax";
  import Dialog from "primevue/dialog";
  import Dropdown from "primevue/dropdown";
  import z from "zod";
  import {
    type RecursiveNonNullable,
    type RecursiveNonPartial,
  } from "~/helpers/type";
  import {
    computed,
    defineComponent,
    onBeforeUnmount,
    onMounted,
    reactive,
    ref,
    unref,
    useMutation,
    useAsyncData,
  } from "#imports";
  import {
    graphql,
  } from "~/graphql/client";
  import {
    // eslint-disable-next-line camelcase
    type IPageGateGuardian_ScanMutation,
  } from "~/graphql/schema";
  import {
    useQuery,
  } from "~/composables/useQuery";

  class ScanError extends Error {
  }

  export default defineComponent({
    name: "GateGuardian",

    components: {
      PDialog: Dialog,
      Dropdown,
    },

    setup() {
      const toast = useToast();

      const vid$ = ref<HTMLVideoElement | null>(null);
      const isReady = ref(false);
      const settings = reactive({
        flash: {
          has: false,
          on: false,
          loading: false,
        },
        cameras: [] as QrScanner.Camera[],
      });

      const scanResumeMutation = useMutation(graphql(/* GraphQL */`
          mutation PageGateGuardian_Scan($userUid: String!, $eventUid: String!, $eventType: String!) {
              gateGuardianScan(userUid: $userUid, eventUid: $eventUid, eventType: $eventType) {
                  user {
                      name
                      phone
                  }
                  hasReservation
                  alreadyScanned
                  error
              }
          }
      `));

      const eventListQuery = useQuery({
        query: graphql(/* GraphQL */`
            query PageGateGuardian_EventList {
                calendar {
                    uid
                    title
                    text
                    type
                }
            }
        `),
      });

      // eslint-disable-next-line camelcase
      type QScan = RecursiveNonPartial<RecursiveNonNullable<IPageGateGuardian_ScanMutation["gateGuardianScan"]>>;

      const scanResult = ref<QScan | null>(null);

      const scanDataValidator = z.object({
        f: z.literal("user"),
        u: z.string(),
      });

      const processScan = async (rawData: string) => {
        const selectedEventValue = unref(selectedEvent);

        if (!selectedEventValue) {
          throw new ScanError("No event selected");
        }

        const validationResult = await scanDataValidator.safeParseAsync(
          JSON.parse(rawData),
        );

        if (!validationResult.success) {
          throw new ScanError(`Invalid QR code: ${ validationResult.error.message }`);
        }

        const { data } = validationResult;

        const respResume = await scanResumeMutation({
          userUid: data.u,
          eventUid: selectedEventValue.uid,
          eventTyle: selectedEventValue.type,
        }).then((resp) => resp?.data?.gateGuardianScan);

        if (!respResume) {
          throw new ScanError("Something went wrong. Please try again.");
        }

        if (respResume.error) {
          throw new ScanError(respResume.error);
        }

        if (!respResume.user) {
          throw new ScanError("Couldn't find user");
        }

        return respResume as QScan;
      };

      let qrScanner: QrScanner | null = null;
      let flashOnInterval: number | null = null;
      {
        onMounted(async () => {
          const vid = unref(vid$);
          if (!vid) {
            return;
          }

          qrScanner = new QrScanner(
            vid,
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            throttle(async (result) => {
              qrScanner?.stop();
              try {
                scanResult.value = await processScan(result.data);
              } catch (e) {
                if (e instanceof ScanError) {
                  toast.add({
                    severity: "warn",
                    summary: e.message,
                    closable: true,
                    life: 3000,
                  });
                }

                await qrScanner?.start();
              }
            }, 500),
            {
              returnDetailedScanResult: true,
              highlightScanRegion: true,
              highlightCodeOutline: true,
            },
          );

          await qrScanner.start().catch((err) => {
            console.error(err);
            // alert("Something went wrong. Please try again");
          });

          isReady.value = true;

          const [
            cameras,
            hasFlash,
            isFlashOn,
          ] = await Promise.all([
            QrScanner.listCameras(true),
            qrScanner.hasFlash(),
            qrScanner.isFlashOn(),
          ]);

          settings.cameras = cameras;
          settings.flash.has = hasFlash;
          settings.flash.on = isFlashOn;

          flashOnInterval = setInterval(() => {
            settings.flash.on = qrScanner?.isFlashOn() ?? false;
          }, 500) as unknown as number;
        });
        onBeforeUnmount(() => {
          qrScanner?.destroy();
          qrScanner = null;
          if (flashOnInterval) {
            clearInterval(flashOnInterval);
          }
        });
      }

      const eventList = useAsyncData(async () => {
        const resp = await eventListQuery().then((res) => res?.data?.calendar ?? []);

        const data = resp.map((x) => {
          const title = x.text ?? x.title ?? `UNKNOWN$${ x.uid }`;
          const type = x.type ?? "unknown";

          return {
            uid: x.uid,
            type,
            title,
          };
        });

        return [
          {
            uid: "",
            type: "ulaz",
            title: "ULAZ",
          },
          ...data,
        ];
      });

      type EventListItem = NonNullable<(typeof eventList)["data"]["value"]>[number];

      const selectedEvent = ref<EventListItem | null>(eventList.data.value?.[0] ?? null);

      return {
        vid$,
        isReady,
        scanResult,
        selectedEvent,
        eventList,
        resumeBool: computed({
          get: () => Boolean(scanResult.value),
          set: () => {
            scanResult.value = null;
          },
        }),
        settings,
        async handleCameraChange(cameraId: string | null | undefined) {
          if (!cameraId) {
            return;
          }

          if (!qrScanner) {
            return;
          }

          isReady.value = false;
          {
            await qrScanner.setCamera(cameraId);
            const [
              hasFlash,
              isFlashOn,
            ] = await Promise.all([
              qrScanner.hasFlash(),
              qrScanner.isFlashOn(),
            ]);

            settings.flash.has = hasFlash;
            settings.flash.on = isFlashOn;
          }
          isReady.value = true;
        },
        async handleFlashToggle() {
          if (!qrScanner) {
            return;
          }

          settings.flash.loading = true;
          await qrScanner.toggleFlash().catch(() => false);
          settings.flash.on = qrScanner?.isFlashOn() ?? false;
          settings.flash.loading = false;
        },
        async handleModalClose() {
          scanResult.value = null;
          await qrScanner?.start();
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .container {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100vw;

    .loadingContainer {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      display: flex;

      h1 {
        align-self: center;
        flex: 1;
        text-align: center;
      }
    }

    video {
      align-self: center;
      width: 100vw;
    }

    .widgets {
      position: absolute;
      bottom: 0;
      left: 0;
      padding: .5rem;
      color: $fer-white;
      background-color: rgb(0 0 0 / 50%);

      :global(.p-dropdown) {
        max-width: calc(min(100vw - 1rem, 16em));
      }
    }
  }

  .eventDropdown {
    max-width: 100%;

    .dropdownItem {
      display: flex;
      gap: .5em;

      .dropdownItemType {
        opacity: .69;

        &::before {
          content: "[";
        }

        &::after {
          content: "]";
        }
      }

      .dropdownItemTitle {
        overflow: auto;
      }
    }
  }

  .reservationHas,
  .reservationHasNot,
  .reservationAlreadyScanned {
    padding: .5em;
    text-align: center;
    font-weight: bold;
    border-radius: 4px;
  }

  .reservationHas {
    background-color: $fer-success;
    color: $fer-white;
  }

  .reservationHasNot {
    background-color: $fer-error;
    color: $fer-white;
  }

  .reservationAlreadyScanned {
    background-color: $fer-yellow;
    color: $fer-black;
  }
</style>
