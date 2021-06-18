<template>
    <nav>
        <v-app-bar color="primary" clipped-left dark>
            <v-app-bar-nav-icon
                @click.stop="drawer = !drawer"
                class="hidden-md-and-up"
                aria-label="Menu"
            />

            <v-btn
                dark
                active-class="no-active"
                class="hidden-sm-and-down"
                text
                tile
                to="/"
            >
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
                v-on="on"
                text
                dark
                v-for="link in links"
                :key="link.text"
                link
                :to="link.path"
                class="hidden-sm-and-down"
            >
                {{ link.text }}
                <v-icon>fas fa-file-alt</v-icon>
            </v-btn>

            <v-menu offset-y open-on-hover>
                <template v-slot:activator="{ on }">
                    <v-btn v-on="on" text dark class="hidden-sm-and-down">
                        <v-icon class="white--text hidden-sm-and-down">
                            mdi-source-branch
                        </v-icon>

                        OAI-PMH
                    </v-btn>
                </template>
                <v-list dense class="pa-0">
                    <v-list-item
                        v-for="link in oai_menu"
                        :key="link.text"
                        link
                        :to="link.path"
                        class="primary"
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
                </v-list>
            </v-menu>

            <v-btn
                v-on="on"
                text
                dark
                link
                :href="'https://www.cenoteando.mx/'"
                class="hidden-sm-and-down"
            >
                CENOTEANDO.MX
                <v-icon class="white--text pl-3"> mdi-exit-to-app </v-icon>
            </v-btn>
        </v-app-bar>

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
    </nav>
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
            path: '/oai-pmh/get-record',
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
