<template>
  <v-app-bar app color="primary" dark clipped-left>
    <v-app-bar-nav-icon
      @click.stop="drawer = !drawer"
      class="hidden-md-and-up"
      aria-label="Menu"
    />
    <v-app-bar-title class="mr-2">
      <v-btn plain block elevation="0" to="/">
        <v-img
          alt="Cenoteando Logo"
          class="shrink mr-2"
          contain
          :src="require('@/assets/logo.png')"
          transition="scale-transition"
          width="40"
        />
        Cenoteando
      </v-btn>
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <span v-if="isOaiPmh"></span>

    <span v-else>
      <v-btn to="/repo" text>
        <span class="mr-2">Repository</span>
      </v-btn>

      <v-btn to="/oai-pmh" text>
        <span class="mr-2">OAI-PMH</span>
      </v-btn>
    </span>
  </v-app-bar>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class NavBar extends Vue {
  name = "NavBar";
  drawer = false;

  get isOaiPmh(): boolean {
    // TODO: return this.$router.???
    return false;
  }
}
</script>

<style lang="scss" scoped>
.no-active::before {
  opacity: 0 !important;
}
nav {
  z-index: 300;
}
</style>
