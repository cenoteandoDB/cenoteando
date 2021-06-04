<template>
    <!--
    TODO: Fix for mobile
        - Place all icons centered vertically (in a flexbox?) (mobile)
        - Place institutional icons centered horizontally (in a flexbox?) and fix social icons to the right (desktop)
    -->
    <div no-gutters>
    <v-footer
        v-if="!footer_blacklist.includes($route.name)"
        class="hidden-sm-and-down"
        color="primary"
        dark
        flat
        app
    >
        <v-row justify="center" align="center" no-gutters>
            <v-col cols="1"></v-col>
            <v-col>
                <v-row justify="center"  align="center" no-gutters>
                    <v-col v-for="(logo, i) in logos" v-bind:key="i" cols="1">
                        <v-img
                            :src="logo.src"
                            :alt="logo.alt"
                            :class="{ 'white-only': logo.white_only }"
                            transition="scale-transition"
                            class="shrink"
                            height="56"
                            contain
                        />
                    </v-col>
                </v-row>
            </v-col>
            <v-col cols="1">
                <v-btn icon href="https://www.facebook.com/cenoteando.unam/">
                    <v-icon size="24px">
                        {{ 'mdi-facebook' }}
                    </v-icon>
                </v-btn>
                <!--
                <br class="hidden-sm-and-down" />
                -->
                <v-btn icon href="https://tinyurl.com/yc6ar7zt">
                    <v-icon size="24px">
                        {{ 'mdi-youtube' }}
                    </v-icon>
                </v-btn>
            </v-col>
        </v-row>
    </v-footer>
    <div class="primary d-flex p-3 col-example hidden-md-and-up" :height="300">
         <v-col justify="center">
                <v-row justify="center" no-gutters>
                    <v-col :width="300" v-for="(logo, i) in logos" v-bind:key="i" cols="1">
                        <v-img
                            :src="logo.src"
                            :alt="logo.alt"
                            :class="{ 'white-only': logo.white_only }"
                            transition="scale-transition"
                            class="shrink"
                            height="30"
			    contain
                        />
                    </v-col>
                </v-row>
            </v-col>
    </div>
	 <div class="primary d-flex p-2 col-example hidden-md-and-up" aling="center" justify="center">
	<v-row align="center" justify="center" no-gutters> 
                <v-btn icon href="https://www.facebook.com/cenoteando.unam/">
                    <v-icon class="white--text" size="19px">
                        {{ 'mdi-facebook' }}
                    </v-icon>
                </v-btn>
                <!--
                <br class="hidden-sm-and-down" />
                -->
                <v-btn icon href="https://tinyurl.com/yc6ar7zt">
                    <v-icon class="white--text" size="19px">
                        {{ 'mdi-youtube' }}
                    </v-icon>
                </v-btn>
	</v-row>
	</div>
    </div>
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
            height: "30",
        },
        {
            src: require('@/assets/logos/ciencias_logo.png'),
            alt: 'logo ciencias',
            white_only: false,
            height: "25",
        },
        {
            src: require('@/assets/logos/logo_centro_geo.png'),
            alt: 'logo centro geo',
            white_only: false,
            height: "25",
        },
        {
            src: require('@/assets/logos/sds_logo.png'),
            alt: 'logo sds',
            white_only: true,
            height: "30",
        },
        {
            src: require('@/assets/logos/logo_uady.png'),
            alt: 'logo uady',
            white_only: true,
            height: "25",
        },
        {
            src: require('@/assets/logos/cenoteando_logo.png'),
            alt: 'logo cenoteando',
            white_only: true,
            height: "25",
        },
    ];
}
</script>

<style lang="scss" scoped>
.white-only {
    filter: brightness(0) invert(1);
}
</style>
