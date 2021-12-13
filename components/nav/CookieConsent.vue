<template>
  <transition name="cookie-consent">
    <div
      v-if="showConsent"
      :class="{
        [$style.container]: true,
      }"
    >
      <div
        :class="$style.body"
      >
        <app-img
          :class="$style.image"
          :src="img.iconCookie"
          alt="Cookie consent icon"
          aspect-ratio="1"
          contain
        />

        <div
          :class="$style.text"
        >
          <translated-text
            trans-key="cookieConsent.text"
          />
          <a
            :class="$style.moreInfo"
            href="#"
            @click.stop="dialog = true"
          >
            <translated-text
              trans-key="cookieConsent.moreInfo.link"
            />
          </a>
        </div>

        <p-button
          :class="$style.acceptButton"
          color="primary"
          @click="acceptConsent"
        >
          <translated-text
            trans-key="Prihvati"
          />
        </p-button>

        <p-button
          :class="$style.closeButton"
          class="p-button-rounded p-button-text p-button-secondary"
          @click="denyConsent"
        >
          <i class="pi pi-times" />
        </p-button>
      </div>

      <client-only>
        <Dialog
          v-model:visible="dialog"
          :style="{ maxWidth: '700px' }"
          dismissable-mask
          header="Pravila o kolačićima za Job Fair Meetup"
          maximizable
          modal
          position="bottom"
        >
          <p>
            Ovo su pravila o kolačićima za Job Fair Meetup, kojima se može pristupiti s adrese <a href="https://jobfairmeetup.fer.unizg.hr/">https://jobfairmeetup.fer.unizg.hr/</a>
          </p>

          <div>
            <p>
              <b>Što su kolačići?</b>
            </p>

            <p>
              Kao što je uobičajena praksa kod gotovo svih profesionalnih stranica, ova internetska stranica koristi kolačiće, odnosno malene datoteke koje se preuzimaju na vaše računalo, radi poboljšanja vašeg
              iskustva. Ova stranica opisuje koje podatke prikupljaju, kako ih koristimo i zašto ponekad moramo pohraniti ove kolačiće. Također ćemo podijeliti kako možete spriječiti pohranu ovih kolačića, no to
              može smanjiti ili onemogućiti određene elemente ili funkcionalnosti stranice. Za općenitije informacije o kolačićima pročitajte ovaj članak.
            </p>
          </div>

          <div>
            <p>
              <b>Kako koristimo kolačiće?</b>
            </p>

            <p>
              Kolačiće koristimo iz raznih razloga opisanih u nastavku. Nažalost, u većini slučajeva ne postoje standardne opcije za onemogućavanje kolačića bez potpunog onemogućavanja funkcionalnosti i značajki
              koje
              dodaju na ovu stranicu. Preporučuje se da ostavite sve kolačiće ako niste sigurni trebate li ih ili ne u slučaju da se koriste za pružanje neke od usluga koju koristite na našoj stranici.
            </p>
          </div>

          <div>
            <p>
              <b>Onemogućavanje kolačića</b>
            </p>

            <p>
              Postavljanje kolačića možete spriječiti podešavanjem postavki na vašem pregledniku (kako to učiniti potražite na službenim stranicama vašeg preglednika). Imajte na umu da će onemogućavanje kolačića
              utjecati na funkcionalnost ove i mnogih drugih internetskih stranica koje posjećujete. Onemogućavanje kolačića obično će rezultirati i onemogućavanjem određenih funkcionalnosti i značajki ove
              internetske stranice. Stoga se preporučuje da omogućite kolačiće.
            </p>
          </div>

          <div>
            <p>
              <b>Kolačiće koje koristimo</b>
            </p>

            <ul>
              <li>
                Kolačići povezani s računom
                <br>
                Ako napravite račun kod nas, mi ćemo koristiti kolačiće za upravljanje postupkom registracije i opću administraciju. Ti se kolačići obično brišu kada se odjavite, no u nekimslučajevima mogu
                ostati i nakon toga da bi zapamtili postavke vaše web lokacije kada ste odjavljeni.
              </li>

              <li>
                Kolačići povezani s prijavom
                <br>
                Kolačiće koristimo kada ste prijavljeni kako bismo se mogli sjetiti ovih podataka. To sprječava da se morate prijaviti svaki put kad posjetite našu stranicu. Ti se kolačići obično uklanjaju ili brišu
                kada se odjavite kako biste osigurali da možete pristupiti ograničenim značajkama i područjima naše stranice samo kada ste prijavljeni.
              </li>

              <li>
                Kolačići povezani s obrascima
                <br>
                Kada podatke šaljete putem obrasca poput onih koji se nalaze na stranicama studentskog poratala, kolačići mogu biti postavljeni tako da pamte vaše korisničke podatke za buduću korespondenciju.
              </li>

              <li>
                Kolačići za preferencije
                <br>
                Kako bismo vam pružili sjajno iskustvo na našoj stranici, pružamo funkcionalnost za podešavanje vaših postavki načina rada naše stranice kada je koristite. Da bismo zapamtili vaše postavke, moramo
                postaviti kolačiće tako da se ti podaci mogu pozivati kad god komunicirate sa stranicom na koju vaše postavke utječu.
              </li>
            </ul>

            <p />
          </div>

          <div>
            <p>
              <b>Kolačići treće strane</b>
            </p>

            <p>
              U nekim posebnim slučajevima koristimo i kolačiće koje pružaju pouzdane treće strane. Sljedeći odjeljak detaljno opisuje koje kolačiće trećih strana možete naići na našoj stranici.
            </p>

            <ul>
              <li>
                Naša stranica koristi Google Analytics, jedno od najraširenijih i najpouzdanijih rješenja za analitiku na internetu, koji nam pomaže da shvatimo kako koristite našu stranicui načine na koje možemo
                poboljšati vaše iskustvo. Ovi kolačići mogu pratiti stvari poput vremena koje provodite na našim stranicama kako bismo nastavili stvarati zanimljiv sadržaj.
                Za više informacija o kolačićima Google Analyticsa pogledajte njihovu službenu stranicu.
              </li>

              <li>
                Povremeno testiramo nove značajke i izvršavamo suptilne promjene u načinu isporuke funkcionalnosti naše stranice. Kada još uvijek testiramo nove značajke, ovi se kolačići mogu koristiti za
                osiguravanje dosljednog iskustva tijekom boravka na stranici, istovremeno osiguravajući da razumijemo koje optimizacije naši korisnici najviše cijene.
              </li>
            </ul>

            <p />
          </div>

          <div>
            <p>
              <b>Više informacija</b>
            </p>

            <p>
              Nadamo se da su vam ova pravila razjasnila zašto su kolačići bitni i kao što je već spomenuto, ako postoji nešto za što niste sigurni trebate li kolačiće ili ne, obično je sigurnije da kolačiće
              ostavite omogućenima u slučaju da su potrebni za interakciju s jednom od značajki koje koristite na našoj stranici.
            </p>
          </div>

          <div>
            <p>
              Međutim, ako i dalje tražite više informacija, možete nas kontaktirati putem naše e-adrese <a href="mailto:jobfair@fer.hr" target="_blank">jobfair@fer.hr</a>.
            </p>
          </div>
        </Dialog>
      </client-only>
    </div>
  </transition>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    ref,
  } from "vue";
  import Dialog from "primevue/dialog";
  import AppImg from "~/components/util/app-img.vue";
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: Type declaration stuff
  import IconCookie from "~/assets/images/component/CookieConsent/icon-cookie.svg";
  import {
    useCookieConsentStore,
  } from "~/store/cookieConsent";

  export default defineComponent({
    components: {
      AppImg,
      Dialog,
    },

    setup() {
      const cookieConsentStore = useCookieConsentStore();

      const dialog = ref(false);

      return {
        acceptConsent: cookieConsentStore.acceptConsent,
        denyConsent: cookieConsentStore.denyConsent,
        showConsent: computed(() => cookieConsentStore.showConsent),
        img: {
          iconCookie: IconCookie,
        },
        dialog,
      };
    },
  });
</script>

<style scoped>
  .cookie-consent-enter-active,
  .cookie-consent-leave-active {
    transition-timing-function: ease-in-out;
    transition-duration: .3s;
    transition-property: opacity, transform;
  }

  .cookie-consent-enter-from,
  .cookie-consent-leave-to {
    transform: translateY(calc(100% + 1.5rem));
    opacity: 0;
  }
</style>

<style lang="scss" module>
  /* stylelint-disable-next-line at-rule-no-unknown */
  @use "sass:map";
  @import "assets/styles/include/all";

  $breakpoint: lg;
  $gap: .875rem;
  $max-width: map.get($breakpoints, $breakpoint);

  .container {
    font-size: 0.875rem;
    position: fixed;
    z-index: 99;
    right: 0;
    bottom: 1.5rem;
    left: 0;
    max-width: $max-width;
    margin: 0 auto;
    padding: $gap;
    transition-timing-function: $transition-timing-function;
    transition-duration: .3s;
    transition-property: bottom, max-width;
    background-color: transparentize($fer-white, .1);
    will-change: bottom, max-width, transform, opacity;
    backdrop-filter: blur(10px);

    @include media($breakpoint) {
      bottom: -1px;
      max-width: 100%;
    }

    .body {
      display: grid;
      align-items: center;
      justify-content: space-evenly;
      grid-template-columns: 40px 4fr 7.8rem 3rem;
      grid-template-rows: auto;
      grid-gap: $gap;
      grid-template-areas: "img text accept close";

      @include media($breakpoint) {
        grid-template-columns: auto;
        grid-template-areas:
          "text   close"
          "accept accept";
        gap: 0;
      }
    }

    .image {
      grid-area: img;

      @include media($breakpoint) {
        display: none !important;
      }
    }

    .text {
      display: inline-block;
      order: 1;
      color: $fer-black;
      grid-area: text;
    }

    .moreInfo {
      font-weight: 600;
      color: $fer-dark-blue;
    }

    .acceptButton {
      order: 2;
      color: $fer-black !important;
      grid-area: accept;

      @include media($breakpoint) {
        order: 4;
        width: 12em;
        margin-top: $gap;
        margin-left: auto;
      }
    }

    .closeButton {
      display: block;
      order: 4;
      min-width: initial;
      padding-right: 0;
      padding-left: 0;
      grid-area: close;

      @include media($breakpoint) {
        $dimension: 4rem;

        order: 2;
        width: calc(#{$dimension} - #{$gap});
        height: $dimension;
        margin-left: $gap;

        > i {
          font-size: 1.5rem;
        }
      }
    }
  }
</style>
