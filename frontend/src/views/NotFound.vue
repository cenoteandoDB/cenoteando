<template>
    <!-- TODO: Implement Page Not Found view -->
    <v-container>
        <v-row align="center" justify="center">
            <v-col cols="auto">
                <h1>Page Not Found</h1>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class NotFound extends Vue {
    created(): void {
        setTimeout(async () => {
            await this.$router.push({ name: 'Home' });
        }, 5000);
    }
}
</script>

<style scoped></style>
