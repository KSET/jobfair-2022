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
        <select @change="handleCameraChange($event.target.value)">
          <option value="">Change camera</option>
          <option
            v-for="camera in settings.cameras"
            :key="camera.id"
            :value="camera.id"
            v-text="camera.label"
          />
        </select>
      </label>
    </div>
    <LazyClientOnly>
      <PDialog v-model:visible="resumeBool" @hide="handleModalClose">
        <h3 v-text="resume.user.name" />
        <h3 v-text="resume.user.phone" />

        <a v-if="resume.cv" :href="resume.cv.url" target="_blank">Životopis</a>

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
  import {
    gql,
  } from "@urql/core";
  import Dialog from "primevue/dialog";
  import {
    Dict,
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
  } from "#imports";
  import {
    IFile,
    IUser,
  } from "~/graphql/schema";

  class ScanError extends Error {
  }

  export default defineComponent({
    name: "GateGuardian",

    components: {
      PDialog: Dialog,
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

      type QScan = {
        user: Pick<IUser, "name" | "phone">,
        cv: Pick<IFile, "uid">,
      };
      type QData = {
        resumeEntryScan: QScan | null,
      };
      type QArgs = {
        userUid: string,
      };

      const resume = ref<QScan | null>(null);

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
                const data = JSON.parse(result.data) as Dict;

                if ("user" !== data?.f) {
                  throw new ScanError(`Wrong QR code type: ${ String(data?.f) }`);
                }

                if (!data?.u) {
                  throw new ScanError("No user data");
                }
                const respResume = await useMutation<QData, QArgs>(gql`
                    mutation Scan($userUid: String!) {
                        resumeEntryScan(userUid: $userUid) {
                            user {
                                name
                                phone
                            }
                            cv {
                                url
                            }
                        }
                    }
                `)({
                  userUid: data.u as string,
                  }).then((resp) => resp?.data?.resumeEntryScan);

                if (!respResume) {
                  throw new ScanError("Couldn't find user");
                }

                resume.value = respResume;
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
            alert("Something went wrong. Please try again");
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

      return {
        vid$,
        isReady,
        resume,
        resumeBool: computed({
          get: () => Boolean(resume.value),
          set: () => {
            resume.value = null;
          },
        }),
        settings,
        async handleCameraChange(cameraId: string) {
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
          resume.value = null;
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
    }
  }
</style>
