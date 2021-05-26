<template>
    <v-app>
        <nav-bar />
        <v-main>
            <error-message />
            <loading />
            <router-view></router-view>
	<app-footer />	
	</v-main>
    </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import NavBar from '@/components/NavBar.vue';
import footer from '@/components/Footer.vue';
import ErrorMessage from '@/components/ErrorMessage.vue';
import Loading from '@/components/Loading.vue';

@Component({
    components: { NavBar, ErrorMessage, Loading, 'app-footer': footer},
})
export default class App extends Vue {}
</script
>
