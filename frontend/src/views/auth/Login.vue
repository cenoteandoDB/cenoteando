<template>
    <v-container>
        <v-row align="center" justify="center">
            <v-col cols="auto">
                <login-card @onSubmit="this.login" />
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import LoginCard from '@/components/auth/LoginCard.vue';

@Component({
    components: { LoginCard },
})
export default class Login extends Vue {
    async login(email: string, password: string): Promise<void> {
        await this.$store.dispatch('loading');
        try {
            await this.$store.dispatch('login', { email, password });
            await this.$router.push({ name: 'Home' }).catch(() => {
                // Ignore errors
                return;
            });
        } catch (error) {
            await this.$store.dispatch('error', error);
        }
        await this.$store.dispatch('clearLoading');
    }
}
</script>

<style lang="scss" scoped></style>
