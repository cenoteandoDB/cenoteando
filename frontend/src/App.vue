<template>
    <v-app id="app" v-bind:class="{ bg: this.hasBackground() }">
        <nav-bar />
        <v-main>
            <error-message />
            <loading />
            <router-view></router-view>
        </v-main>
        <Footer />
    </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import NavBar from '@/components/NavBar.vue';
import Footer from '@/components/Footer.vue';
import ErrorMessage from '@/components/ErrorMessage.vue';
import Loading from '@/components/Loading.vue';
import axios from 'axios';

@Component({
    components: { NavBar, ErrorMessage, Loading, Footer },
})
export default class App extends Vue {
    created(): void {
        axios.interceptors.response.use(undefined, (err) => {
            return new Promise(() => {
                if (
                    err.status === 401 &&
                    err.config &&
                    !err.config.__isRetryRequest
                ) {
                    this.$store.dispatch('logout');
                }
                throw err;
            });
        });
    }

    hasBackground(): boolean {
        const route = this.$route.name || '';
        return ['Home', 'Login', 'Signup'].includes(route);
    }
}
</script>

<style lang="scss" scoped>
.bg {
    background: url('assets/cenote5.jpeg') no-repeat center center fixed !important;
    background-size: cover !important;
}
</style>
