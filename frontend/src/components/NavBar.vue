<template>
    <div>
        <v-navigation-drawer
            v-model="drawer"
            app
            class="primary hidden-md-and-up"
            :width="240"
        >
            <v-list>
                <v-list-item to="/" @click="drawer = false">
                    <v-list-item-avatar>
                        <img
                            :src="require('@/assets/logos/logo.png')"
                            alt="cenoteando logo"
                        />
                    </v-list-item-avatar>
                    <v-list-item-content>
                        <v-list-item-title class="text-h6 white--text">
                            CENOTEANDO
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item
                    v-for="link in links"
                    :key="link.text"
                    link
                    :to="link.path"
                    style="left: 18px"
                >
                    <v-list-item-action>
                        <v-icon class="white--text">{{ link.icon }}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title class="white--text">{{
                            link.text
                        }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-list-group :value="false">
                    <template v-slot:activator>
                        <v-list-item>
                            <v-list-item-action>
                                <v-icon class="white--text">
                                    mdi-source-branch
                                </v-icon>
                            </v-list-item-action>
                            <v-list-item-content>
                                <v-list-item-title class="white--text">
                                    OAI-PMH
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </template>
                    <v-list-item-group>
                        <v-list-item
                            v-for="link in oai_menu"
                            :key="link.text"
                            link
                            :to="link.path"
                            class="primary ml-3"
                            style="left: 18px"
                        >
                            <v-list-item-action>
                                <v-icon class="white--text">{{
                                    link.icon
                                }}</v-icon>
                            </v-list-item-action>
                            <v-list-item-content>
                                <v-list-item-title class="white--text">{{
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
                    style="left: 18px"
                >
                    <v-list-item-action>
                        <v-icon class="white--text"> mdi-exit-to-app </v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title class="white--text">
                            CENOTEANDO.MX
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>
        <!-- TODO: Improvements are needed (use v-list and v-menu?) -->
        <v-toolbar
            style="display: flex, justify-content: space-between"
            app
            color="primary"
            dark
            clipped-left
            elevate-on-scroll
        >
            <div style="flex: 1 1 auto">
                <v-app-bar-nav-icon
                    @click.stop="drawer = !drawer"
                    class="hidden-md-and-up"
                    aria-label="Menu"
                    :width="18"
                ></v-app-bar-nav-icon>
                <v-app-bar-title>
                    <v-btn
                        class="hidden-sm-and-down"
                        style="left: 0px"
                        plain
                        block
                        elevation="0"
                        to="/"
                    >
                        <v-img
                            alt="Cenoteando Logo"
                            class="shrink mr-2"
                            contain
                            :src="require('@/assets/logos/logo.png')"
                            transition="scale-transition"
                            width="40"
                        />
                        <span>Cenoteando</span>
                    </v-btn>
                </v-app-bar-title>
            </div>

            <v-list-item to="/" @click="drawer = false"> </v-list-item>
            <v-toolbar-items
                v-for="link in links"
                :key="link.text"
                link
                :to="link.path"
                style="left: 18px"
                class="hidden-sm-and-down"
            >
                <v-btn
                    flat
                    v-for="link in links"
                    :key="link.title"
                    :to="link.path"
                >
                    <v-toolbar-title class="white--text">{{
                        link.text
                    }}</v-toolbar-title>
                </v-btn>
                <v-btn flat link :href="'https://www.cenoteando.mx/'">
                    <v-toolbar-title class="white--text">
                        CENOTEANDO.MX
                    </v-toolbar-title>
                </v-btn>
                <v-list-group :value="false">
                    <template v-slot:activator>
                        <v-toolbar-items>
                            <v-btn>
                                <v-list-item-title class="white--text">
                                    OAI-PMH
                                </v-list-item-title>
                            </v-btn>
                        </v-toolbar-items>
                    </template>
                    <v-list-item-group>
                        <v-list-item
                            v-for="link in oai_menu"
                            :key="link.text"
                            link
                            :to="link.path"
                            class="primary ml-3"
                            style="left: 18px"
                        >
                            <v-list-item-content>
                                <v-list-item-title class="white--text">{{
                                    link.text
                                }}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list-item-group>
                </v-list-group>
                <v-divider vertical></v-divider>
            </v-toolbar-items>
        </v-toolbar>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class NavBar extends Vue {
    name = 'NavBar';
    drawer = false;

    links = [{ icon: 'mdi-map', text: 'MAP', path: '/map' }];
    oai_menu = [
        {
            icon: 'mdi-account-box-outline',
            text: 'IDENTIFY',
            path: '/oai-pmh',
        },
        {
            icon: 'mdi-magnify',
            text: 'GET RECORD',
            path: 'oai-pmh/get-record',
        },
        {
            icon: 'mdi-view-list',
            text: 'LIST RECORDS',
            path: '/oai-pmh/list-records',
        },
    ];

    get isOai(): boolean {
        return this.$route.path.startsWith('/oai-pmh');
    }
}
</script>

<style lang="scss" scoped>
.no-active::before {
    opacity: 0 !important;
}
nav {
    z-index: 500;
}
</style>
