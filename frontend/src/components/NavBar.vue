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

            <template v-for="(link, i) in activeLinks">
                <v-btn
                    v-if="!link.children"
                    :key="i"
                    :to="link.to"
                    :data-cy="link.dataCy"
                    @click="link.action"
                    text
                    link
                    dark
                    class="hidden-sm-and-down"
                >
                    <v-icon>{{ link.icon }}</v-icon>
                    {{ link.text }}
                </v-btn>
                <v-menu v-else :key="i" offset-y open-on-hover>
                    <template v-slot:activator="{ on }">
                        <v-btn
                            v-on="on"
                            :to="link.to"
                            @click="link.action"
                            text
                            link
                            dark
                            class="hidden-sm-and-down"
                        >
                            <v-icon>{{ link.icon }}</v-icon>
                            {{ link.text }}
                        </v-btn>
                    </template>
                    <v-list dense class="pa-0">
                        <v-list-item
                            v-for="child in link.children"
                            :key="child.text"
                            :to="child.to"
                            :data-cy="child.dataCy"
                            @click="link.action"
                            link
                            color="primary"
                        >
                            <v-list-item-action>
                                <v-icon>{{ child.icon }}</v-icon>
                            </v-list-item-action>
                            <v-list-item-content>
                                <v-list-item-title>{{
                                    child.text
                                }}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>

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
                <template v-for="(link, i) in activeLinks">
                    <v-list-item
                        v-if="!link.children"
                        :key="i"
                        :to="link.to"
                        :data-cy="link.dataCy + '-side'"
                        @click="link.action"
                        dark
                    >
                        <v-list-item-action class="pl-2">
                            <v-icon>{{ link.icon }}</v-icon>
                        </v-list-item-action>
                        <v-list-item-content>
                            <v-list-item-title>{{
                                link.text
                            }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>

                    <v-list-group v-else :key="i">
                        <template v-slot:activator>
                            <v-list-item>
                                <v-list-item-action>
                                    <v-icon>{{ link.icon }}</v-icon>
                                </v-list-item-action>
                                <v-list-item-content>
                                    <v-list-item-title>{{
                                        link.text
                                    }}</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </template>
                        <v-list-item-group>
                            <v-list-item
                                v-for="child in link.children"
                                :key="child.text"
                                :to="child.to"
                                :data-cy="child.dataCy + '-side'"
                                @click="link.action"
                                class="pl-6"
                                color="white"
                            >
                                <v-list-item-action>
                                    <v-icon color="white">{{ child.icon }}</v-icon>
                                </v-list-item-action>
                                <v-list-item-content>
                                    <v-list-item-title class="white--text">{{
                                        child.text
                                    }}</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list-item-group>
                    </v-list-group>
                </template>
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
import { mapGetters } from 'vuex';

interface NavIcon {
    icon: string;
    dataCy: string;
    text: string;
    to?: string;
    action?: () => void;
    condition?: () => boolean;
    children?: Omit<NavIcon, 'children'>[];
}

@Component({
    computed: {
        ...mapGetters(['isLoggedIn', 'isAdmin']),
    },
})
export default class NavBar extends Vue {
    name = 'NavBar';
    isLoggedIn!: boolean;
    isAdmin!: boolean;
    drawer = false;

    private _links: NavIcon[] = [];

    created(): void {
        this._links = [
            {
                icon: 'mdi-shield-account',
                dataCy: 'admin',
                text: 'ADMIN',
                to: '/admin',
                condition: () => this.isAdmin,
                children: [
                    {
                        icon: 'mdi-monitor-dashboard',
                        dataCy: 'dashboard',
                        text: 'DASHBOARD',
                        to: '/admin',
                    },
                    {
                        icon: 'mdi-monitor-edit',
                        dataCy: 'variables',
                        text: 'VARIABLES',
                        to: '/admin/variables',
                    },
                    {
                        icon: 'mdi-monitor-edit',
                        dataCy: 'users',
                        text: 'USERS',
                        to: '/admin/users',
                    },
                    {
                        icon: 'mdi-monitor-edit',
                        dataCy: 'cenotes',
                        text: 'CENOTES',
                        to: '/admin/cenotes',
                    },
                    {
                        icon: 'mdi-monitor-edit',
                        dataCy: 'species',
                        text: 'SPECIES',
                        to: '/admin/species',
                    },
                    {
                        icon: 'mdi-monitor-edit',
                        dataCy: 'references',
                        text: 'REFERENCES',
                        to: '/admin/references',
                    },
                ],
            },
            {
                icon: 'mdi-map',
                dataCy: 'map',
                text: 'MAP',
                to: '/map',
            },
            {
                icon: 'mdi-source-branch',
                dataCy: 'oai-pmh',
                text: 'OAI-PMH',
                to: '/oai-pmh',
                children: [
                    {
                        icon: 'mdi-account-box-outline',
                        dataCy: 'identify',
                        text: 'IDENTIFY',
                        to: '/oai-pmh/identify',
                    },
                    {
                        icon: 'mdi-magnify',
                        text: 'GET RECORD',
                        dataCy: 'get-record',
                        to: '/oai-pmh/get-record',
                    },
                    {
                        icon: 'mdi-view-list',
                        text: 'LIST RECORDS',
                        dataCy: 'list-records',
                        to: '/oai-pmh/list-records',
                    },
                ],
            },
            {
                icon: 'mdi-account',
                dataCy: 'login',
                text: 'LOGIN / SIGN UP',
                to: '/login',
                condition: () => !this.isLoggedIn,
            },
            {
                icon: 'mdi-account-off',
                dataCy: 'logout',
                text: 'LOGOUT',
                action: this.logout,
                condition: () => this.isLoggedIn,
            },
        ];
    }

    get activeLinks(): NavIcon[] {
        let links = this._links.filter(
            (link) => link.condition == undefined || link.condition(),
        );
        links.map((link) => {
            if (!link.action)
                link.action = () => {
                    return;
                };
            if (link.children)
                link.children = link.children.filter(
                    (child) =>
                        child.condition == undefined || child.condition(),
                );
            return link;
        });
        return links;
    }

    async logout(): Promise<void> {
        await this.$store.dispatch('logout');
        await this.$router.push({ name: 'Home' }).catch(() => {
            // Ignore errors
            return;
        });
    }
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
