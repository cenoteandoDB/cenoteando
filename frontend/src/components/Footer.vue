<template>
    <v-footer
        v-if="!footer_blacklist.includes($route.name)"
        color="primary"
        app
        absolute
        flat
        dark
    >
        <v-container fluid class="pa-0">
            <v-row no-gutters align="center" justify="space-around">
                <v-col cols="2">
                    <span>DGAPA-PAPIIT-IN228319</span>
                </v-col>
                <v-col cols="1" class="hidden-sm-and-down"></v-col>
                <v-col cols="1" v-for="(logo, i) in logos" v-bind:key="i">
                    <v-img
                        :src="logo.src"
                        :alt="logo.alt"
                        :class="{ 'white-only': logo.white_only }"
                        transition="scale-transition"
                        class="shrink"
                        :height="50"
                        contain
                    />
                </v-col>
                <v-col cols="2" class="hidden-sm-and-down"></v-col>
                <v-col cols="1">
                    <v-btn
                        icon
                        href="https://www.facebook.com/cenoteando.unam/"
                    >
                        <v-icon class="shrink">
                            {{ 'mdi-facebook' }}
                        </v-icon>
                    </v-btn>
                    <v-btn icon href="https://tinyurl.com/yc6ar7zt">
                        <v-icon class="shrink">
                            {{ 'mdi-youtube' }}
                        </v-icon>
                    </v-btn>
                </v-col>
                <v-col cols="5" class="hidden-sm-and-down"></v-col>
            </v-row>
        </v-container>
    </v-footer>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Footer extends Vue {
    // Name of routes that should not have footer
    footer_blacklist = ['Map'];

    logos = [
        {
            src: require('@/assets/logos/unam_logo.png'),
            alt: 'logo unam',
            white_only: false,
            height: '30',
        },
        {
            src: require('@/assets/logos/ciencias_logo.png'),
            alt: 'logo ciencias',
            white_only: false,
            height: '30',
        },
        {
            src: require('@/assets/logos/logo_centro_geo.png'),
            alt: 'logo centro geo',
            white_only: false,
            height: '25',
        },
        {
            src: require('@/assets/logos/sds_logo.png'),
            alt: 'logo sds',
            white_only: true,
            height: '30',
        },
        {
            src: require('@/assets/logos/logo_uady.png'),
            alt: 'logo uady',
            white_only: true,
            height: '25',
        },
        {
            src: require('@/assets/logos/cenoteando_logo.png'),
            alt: 'logo cenoteando',
            white_only: true,
            height: '25',
        },
    ];
}
</script>

<style lang="scss" scoped>
.white-only {
    filter: brightness(0) invert(1);
}
</style>
