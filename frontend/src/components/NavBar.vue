<template>
  <v-app-bar app color="primary" dark>
    <div class="d-flex align-center">
      <v-img
        alt="Cenoteando Logo"
        class="shrink mr-2"
        contain
        :src="require('@/assets/logo.png')"
        transition="scale-transition"
        width="40"
      />
    </div>
    <v-app-bar-title href="#" class="mr-2">Cenoteando</v-app-bar-title>

    <v-spacer></v-spacer>

    <v-btn to="/repo" text>
      <span class="mr-2">Repository</span>
    </v-btn>

    <v-btn to="/oai-pmh" text>
      <span class="mr-2">OAI-PMH</span>
    </v-btn>
  </v-app-bar>
</template>

<script>
export default {
  name: "NavBar",
};
</script>

<style scoped></style>
