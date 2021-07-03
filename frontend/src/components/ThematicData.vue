<template>
    <v-container>
        <v-card> <v-card-text>Content</v-card-text></v-card>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class ThematicData extends Vue {
    currentTab = 3;
}
</script>

<style scoped lang="scss"></style>
