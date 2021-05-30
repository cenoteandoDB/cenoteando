<template>
    <v-app id="app" v-bind:class="{ bg: this.$route.name === 'Home' }">
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

@Component({
    components: { NavBar, ErrorMessage, Loading, Footer },
})
export default class App extends Vue {}
</script>

<style lang="scss" scoped>
.bg {
    background: url('assets/cenote5.jpeg') no-repeat center center fixed !important;
    background-size: cover !important;
}
</style>
