<template>
    <v-container>
        <v-row align="center" justify="center">
            <v-col cols="auto">
                <signup-card @onSubmit="this.signup" />
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import SignupCard from '@/components/auth/SignupCard.vue';

@Component({
    components: { SignupCard },
})
export default class Signup extends Vue {
    async signup(name: string, email: string, password: string): Promise<void> {
        await this.$store.dispatch('loading');
        try {
            await this.$store.dispatch('signup', { name, email, password });
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
