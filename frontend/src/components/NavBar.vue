<template>
    <!-- TODO: Fix for mobile (v-navigation-drawer)-->
    <!-- TODO: Improvements are needed (use v-list and v-menu?) -->
    <v-app-bar app color="primary" dark clipped-left elevate-on-scroll>
        <v-app-bar-nav-icon
            @click.stop="drawer = !drawer"
            class="hidden-md-and-up"
            aria-label="Menu"
        />
	<v-navigation-drawer app class="primary hidden-md-and-up">
	<v-list>
	<v-list-tile v-for="link in links" :key="link.text">
		<v-list-tile-action>
			<v-icon class="white--text">{{ link.icon}}</v-icon>
		</v-list-tile-action>
		<v-list-tile-content>
			<v-list-tile-title class="white--text">{{ link.text }}<v-list-tile-title>
		</v-list-tile-content>
	<v-list-tile>
	</v-list>		
	</v-navigation-drawer>
        <v-app-bar-title>
            <v-btn plain block elevation="0" to="/">
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
        <v-spacer></v-spacer>

        <span v-if="isOai" class="hidden-sm-and-down">
            <v-btn to="/oai-pmh/identify" text class="mr-2">
                <span class="mr-2">Identify</span>
            </v-btn>
            <v-btn to="/oai-pmh/list-records" text class="mr-2">
                <span class="mr-2">List Records</span>
            </v-btn>

            <v-btn to="/oai-pmh/get-record" text class="mr-2">
                <span class="mr-2">Get Record</span>
            </v-btn>
        </span>

        <span v-else class="hidden-sm-and-down">
            <v-btn text class="mr-2" href="https://www.cenoteando.mx">
                <span class="mr-2">Cenoteando.mx</span>
            </v-btn>
            <v-btn to="/map" text class="mr-2">
                <span class="mr-2">Map</span>
            </v-btn>
            <v-btn to="/oai-pmh" text class="mr-2">
                <span class="mr-2">OAI-PMH</span>
            </v-btn>
        </span>
    </v-app-bar>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class NavBar extends Vue {
    name = 'NavBar';
    drawer = false;

    get isOai(): boolean {
        return this.$route.path.startsWith('/oai-pmh');
    }
    data() {
	return {
		links:[
			{ icon: 'folder', text:'identifyyy'}
]
}
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
