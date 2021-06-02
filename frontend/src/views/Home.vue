<template>
    <!-- TODO: Fix for mobile -->
    <v-container fill-height fluid>
        <v-row align="center" justify="center">
            <v-sheet class="highlight hidden-sm-and-down">
                <v-img
                    style="filter: brightness(0) invert(1)"
                    :src="require('@/assets/logos/cenoteando_logo.png')"
                    contain
                    height="256"
                />
                <h2 class="pa-10 text-center">
                    Repositorio institucional de cenotes <br />
                    de la facultad de ciencias de la UNAM
                </h2>
            </v-sheet>
            <v-sheet class="highlight hidden-md-and-up">
                <v-img
                    style="filter: brightness(0) invert(1)"
                    :src="require('@/assets/logos/cenoteando_logo.png')"
                    contain
                    height="50"
                />
                <h6 class="pa-10 text-center">
                    Repositorio institucional de cenotes <br />
                    de la facultad de ciencias de la UNAM
                </h6>
            </v-sheet>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Home extends Vue {}
</script>

<style lang="scss" scoped>
.highlight {
    width: 500px;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    color: white;
}
</style>
