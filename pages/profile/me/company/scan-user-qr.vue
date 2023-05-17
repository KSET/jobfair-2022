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
        <select v-model="selectedCamera">
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
      <PDialog v-model:visible="resumeBool" :class="$style.dialog" :closable="!scanFormLoading" @hide="handleModalClose">
        <h3 v-text="scanResult!.user.name" />
        <h3 v-text="scanResult!.user.email" />

        <p>
          ✅ <TranslatedText v-if="scanResult?.alreadyScanned" trans-key="profile.me.company.scan-user-qr.already-scanned" /><TranslatedText v-else trans-key="profile.me.company.scan-user-qr.scan-ok" />
        </p>

        <form :class="$style.scanNote" @submit="handleScanFormSubmit">
          <label for="user-scan-note"><TranslatedText trans-key="resume.user.note" /></label>
          <textarea id="user-scan-note" v-model="scanFormData.note" name="user-scan-note" />
          <div class="flex">
            <p-button
              class="ml-auto mt-1"
              size="small"
              icon="pi pi-save"
              label="Save"
              :loading="scanFormLoading"
              type="submit"
            />
          </div>
        </form>

        <template #footer>
          <p-button
            text
            :icon="scanResult?.isStarred ? 'pi pi-star-fill': 'pi pi-star'"
            :label="scanResult?.isStarred ? 'Unstar': 'Star'"
            :loading="scanFormLoading"
            @click="handleStarToggle"
          />

          <p-button
            :disabled="scanFormLoading"
            label="OK"
            icon="pi pi-times"
            class="p-button-text"
            @click="handleModalClose"
          />
        </template>
      </PDialog>
    </LazyClientOnly>
  </div>
</template>

<script lang="ts" setup>
  import {
    throttle,
  } from "rambdax";
  import {
    useToast,
  } from "primevue/usetoast";
  import QrScanner from "qr-scanner";
  import PDialog from "primevue/dialog";
  import z from "zod";
  import {
    Maybe,
  } from "~/helpers/type";
  import {
    graphql,
  } from "~/graphql/client";
  import {
    PageProfileMeCompanyScanUserQrScanMutation,
  } from "~/graphql/client/graphql";

  useTitle("Scan user QR");

  class ScanError extends Error {
  }

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

  type QData = PageProfileMeCompanyScanUserQrScanMutation;
  type QScanResult = NonNullable<QData["scanUserQr"]>;
  type QUser = NonNullable<QScanResult["user"]>;

  type ScanData = {
    user: QUser,
    isStarred: boolean,
    note: Maybe<string>,
    alreadyScanned: boolean,
  };

  const selectedCamera = ref<string | null>(null);
  watch(selectedCamera, (val) => {
    void handleCameraChange(val);
  });

  const scanResult = ref<ScanData | null>(null);

  const scanFormData = reactive({
    note: "",
  });

  const scanFormLoading = ref(false);

  const scanUserMutation = useMutation(graphql(/* GraphQL */`
      mutation PageProfileMeCompanyScanUserQrScan($userUid: String!) {
          scanUserQr(userUid: $userUid) {
              user {
                  uid
                  name
                  email
              }
              isStarred
              alreadyScanned
              note
              error
          }
      }
  `));

  const refineUserScanMutation = useMutation(graphql(/* GraphQL */`
    mutation PageProfileMeCompanyScanUserQrRefineQrScan($userUid: String!, $refineData: CompanyScanUserQrRefineData!) {
        scanUserQrRefine(userUid: $userUid, refineData: $refineData) {
            user {
                uid
                name
                email
            }
            isStarred
            note
            error
        }
    }
  `));

  let qrScanner: QrScanner | null = null;
  let flashOnInterval: number | null = null;

  const handleScanResult = async (result: QrScanner.ScanResult) => {
    qrScanner?.stop();
    try {
      const validation = z.object({
        f: z.literal("user"),
        u: z.string(),
      }).safeParse(JSON.parse(result.data));

      if (!validation.success) {
        throw new ScanError("Invalid QR code");
      }

      const resp = await scanUserMutation({
        userUid: validation.data.u,
      }).then((resp) => resp?.data?.scanUserQr).catch((e) => {
        console.error(e);
        throw new ScanError("Something went wrong. Please try again");
      });

      if (resp?.error) {
        throw new ScanError(resp.error);
      }

      const user = resp?.user;
      if (!user) {
        throw new ScanError("Something went wrong (no user)");
      }

      scanResult.value = {
        user,
        isStarred: Boolean(resp.isStarred),
        alreadyScanned: Boolean(resp.alreadyScanned),
        note: resp.note,
      };

      scanFormData.note = resp.note || "";
    } catch (e) {
      if (e instanceof ScanError) {
        toast.add({
          severity: "warn",
          summary: e.message,
          closable: true,
          life: 3000,
        });
      } else {
        console.error(e);
        toast.add({
          severity: "error",
          summary: "Something went wrong. Please try again",
          detail: (e && "object" === typeof e && "message" in e) ? e.message : String(e),
          closable: true,
          life: 3000,
        });
      }
      await qrScanner?.start();
    }
  };

  {
    onMounted(async () => {
      const vid = unref(vid$);
      if (!vid) {
        return;
      }

      qrScanner = new QrScanner(
        vid,
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        throttle(handleScanResult, 500),
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

  const resumeBool = computed({
    get: () => Boolean(scanResult.value),
    set: () => {
      scanResult.value = null;
    },
  });

  const handleCameraChange = async (cameraId: string | null | undefined) => {
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
  };
  const handleFlashToggle = async () => {
    if (!qrScanner) {
      return;
    }

    settings.flash.loading = true;
    await qrScanner.toggleFlash().catch(() => false);
    settings.flash.on = qrScanner?.isFlashOn() ?? false;
    settings.flash.loading = false;
  };

  const handleModalClose = async () => {
    scanResult.value = null;
    await qrScanner?.start();
  };

  const handleScanFormSubmit = async (e: Event) => {
    e.preventDefault();

    const user = scanResult.value?.user;
    if (!user) {
      return;
    }

    scanFormLoading.value = true;
    try {
      const resp = await refineUserScanMutation({
        userUid: user.uid,
        refineData: {
          note: scanFormData.note,
        },
      }).then((resp) => resp?.data?.scanUserQrRefine);

      if (resp?.error) {
        toast.add({
          severity: "error",
          summary: resp.error,
          closable: true,
          life: 3000,
        });
      }

      {
        const user = resp?.user;

        if (user) {
          scanResult.value = {
            user,
            isStarred: Boolean(resp.isStarred),
            alreadyScanned: scanResult.value?.alreadyScanned ?? false,
            note: resp.note,
          };
        }
      }
    } finally {
      scanFormLoading.value = false;
    }
  };

  const handleStarToggle = async (e: Event) => {
    e.preventDefault();

    const user = scanResult.value?.user;
    if (!user) {
      return;
    }

    scanFormLoading.value = true;
    try {
      const resp = await refineUserScanMutation({
        userUid: user.uid,
        refineData: {
          isStarred: !scanResult.value?.isStarred,
        },
      }).then((resp) => resp?.data?.scanUserQrRefine);


      if (resp?.error) {
        toast.add({
          severity: "error",
          summary: resp.error,
          closable: true,
          life: 3000,
        });
      }

      {
        const user = resp?.user;

        if (user) {
          scanResult.value = {
            user,
            isStarred: Boolean(resp.isStarred),
            alreadyScanned: scanResult.value?.alreadyScanned ?? false,
            note: resp.note,
          };
        }
      }
    } finally {
      scanFormLoading.value = false;
    }
  };
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

  .dialog {

    .scanNote {
      display: flex;
      flex-direction: column;
    }

    :global(.p-dialog-footer) {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
</style>
