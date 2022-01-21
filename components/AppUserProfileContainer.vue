<template>
  <div :class="$style.container">
    <aside :class="$style.aside">
      <div :class="$style.avatarContainer">
        <profile-picture />
      </div>
      <div :class="$style.linksContainer">
        <ul>
          <li>
            <nuxt-link
              :to="{ name: 'profile-me' }"
            >
              <translated-text
                trans-key="profile.my-profile"
              />
            </nuxt-link>
          </li>
          <li>
            <nuxt-link
              :to="{ name: 'profile-me-settings' }"
            >
              <translated-text
                trans-key="profile.settings"
              />
            </nuxt-link>
          </li>
        </ul>
      </div>
    </aside>

    <div :class="$style.content">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
  import {
    defineComponent,
  } from "vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import ProfilePicture from "~/components/user/profile/profile-picture.vue";

  export default defineComponent({
    components: {
      TranslatedText,
      ProfilePicture,
    },
  });
</script>

<style lang="scss" module>
  @use "sass:color";
  @import "assets/styles/include";

  .container {
    display: flex;
    flex: 1;

    .aside {
      display: flex;
      flex-direction: column;
      width: 300px;
      padding: 3.75rem 1rem 2rem;
      background-color: $fer-dark-blue;

      @include media(md) {
        display: none;
      }

      .avatarContainer {
        overflow: hidden;
        width: 60%;
        margin: 0 auto;
        border: 2px solid $fer-off-gray;
        border-radius: 100%;
        background-color: $fer-gray;
      }

      .linksContainer {
        display: flex;
        flex-direction: column;
        margin-top: 5rem;

        > ul {
          margin: 0;
          padding: 0;
          list-style: none;
          text-align: center;

          > li + li {
            margin-top: 1rem;
          }

          > li {

            > a {
              font-size: 1.125rem;
              font-weight: 600;
              line-height: 1.3125rem;
              padding-inline: .625rem;
              padding-bottom: .25rem;
              transition-property: border-color, padding;
              text-transform: capitalize;
              color: $fer-white;
              border-bottom: 1px solid;

              &:global(.router-link-exact-active) {
                padding-inline: 1.25rem;
                color: $fer-yellow;

                &:hover {
                  padding-inline: 1.25rem;
                }
              }

              &:hover {
                padding-inline: .75rem;
                transition-duration: 0s;
                border-color: #{color.mix($fer-white, $fer-yellow, 50%)} !important;
              }
            }
          }
        }
      }
    }

    .content {
      flex: 1;
      padding: 2.5rem;
    }
  }
</style>
