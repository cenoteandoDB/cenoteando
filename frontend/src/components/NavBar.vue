<template>
    <nav>
        <v-app-bar color="primary" clipped-left dark>
            <v-app-bar-nav-icon
                @click.stop="drawer = !drawer"
                class="hidden-md-and-up"
                aria-label="Menu"
            />

            <!-- Start desktop section -->
            <v-btn dark active-class="no-active" text tile to="/">
                <v-list-item-avatar>
                    <img
                        :src="require('@/assets/logos/logo.png')"
                        alt="cenoteando logo"
                    />
                </v-list-item-avatar>

                CENOTEANDO
            </v-btn>
            <v-spacer></v-spacer>

            <v-btn
                v-for="link in links"
                :key="link.text"
                :to="link.path"
                text
                link
                dark
                class="hidden-sm-and-down"
            >
                <v-icon>{{ link.icon }}</v-icon>
                {{ link.text }}
            </v-btn>

            <v-menu offset-y open-on-hover>
                <template v-slot:activator="{ on }">
                    <v-btn
                        v-on="on"
                        to="/oai-pmh"
                        text
                        link
                        dark
                        class="hidden-sm-and-down"
                    >
                        <v-icon>mdi-source-branch </v-icon>
                        OAI-PMH
                    </v-btn>
                </template>
                <v-list dense class="pa-0">
                    <v-list-item
                        v-for="link in oai_menu"
                        :key="link.text"
                        :to="link.path"
                        link
                        color="primary"
                    >
                        <v-list-item-action>
                            <v-icon>{{ link.icon }}</v-icon>
                        </v-list-item-action>
                        <v-list-item-content>
                            <v-list-item-title>{{
                                link.text
                            }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-menu>

            <v-btn
                text
                dark
                link
                :href="'https://www.cenoteando.mx/'"
                target="_blank"
                class="hidden-sm-and-down"
            >
                CENOTEANDO.MX
                <v-icon class="pl-3"> mdi-exit-to-app </v-icon>
            </v-btn>
            <!-- End desktop section -->
        </v-app-bar>

        <!-- Start mobile section -->
        <v-navigation-drawer
            v-if="drawer && this.$vuetify.breakpoint.smAndDown"
            v-model="drawer"
            app
            dark
            class="primary hidden-md-and-up"
            :width="240"
        >
            <v-list nav>
                <v-list-item to="/" @click="drawer = false">
                    <v-list-item-avatar>
                        <img
                            :src="require('@/assets/logos/logo.png')"
                            alt="cenoteando logo"
                        />
                    </v-list-item-avatar>
                    <v-list-item-content>
                        <v-list-item-title class="text-h6">
                            CENOTEANDO
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item
                    v-for="link in links"
                    :key="link.text"
                    :to="link.path"
                    dark
                >
                    <v-list-item-action class="pl-2">
                        <v-icon>{{ link.icon }}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>{{ link.text }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-list-group>
                    <template v-slot:activator>
                        <v-list-item>
                            <v-list-item-action>
                                <v-icon> mdi-source-branch</v-icon>
                            </v-list-item-action>
                            <v-list-item-content>
                                <v-list-item-title> OAI-PMH </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </template>
                    <v-list-item-group>
                        <v-list-item
                            v-for="link in oai_menu"
                            :key="link.text"
                            :to="link.path"
                            class="pl-6"
                            color="white"
                        >
                            <v-list-item-action>
                                <v-icon>{{ link.icon }}</v-icon>
                            </v-list-item-action>
                            <v-list-item-content>
                                <v-list-item-title>{{
                                    link.text
                                }}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list-item-group>
                </v-list-group>
                <v-divider vertical></v-divider>
                <v-list-item
                    link
                    :href="'https://www.cenoteando.mx/'"
                    target="_blank"
                >
                    <v-list-item-action class="pl-2">
                        <v-icon> mdi-exit-to-app </v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title> CENOTEANDO.MX </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>
        <!-- End mobile section -->
    </nav>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class NavBar extends Vue {
    name = 'NavBar';
    drawer = false;

    links = [
        {text: 'SIGN UP', path: '/sign-up'},
        { text: 'LOGIN', path: '/login' },
        { icon: 'mdi-map', text: 'MAP', path: '/map' },
    ];
    oai_menu = [
        {
            icon: 'mdi-account-box-outline',
            text: 'IDENTIFY',
            path: '/oai-pmh/identify',
        },
        {
            icon: 'mdi-magnify',
            text: 'GET RECORD',
            path: '/oai-pmh/get-record',
        },
        {
            icon: 'mdi-view-list',
            text: 'LIST RECORDS',
            path: '/oai-pmh/list-records',
        },
    ];
}
</script>

<style lang="scss" scoped>
.no-active::before {
    opacity: 0 !important;
}
nav {
    z-index: 10000;
}
</style>
