<template>
    <v-container>
        <v-row class="pt-10">
            <v-col class="d-flex justify-center">
                <v-spacer></v-spacer>
                <v-tooltip
                    bottom
                    v-for="variable in variables"
                    :key="variable._key"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-icon
                            x-large
                            color="green"
                            v-bind="attrs"
                            v-on="on"
                            v-if="variable._key"
                            dense
                            >{{ icons[variable._key] }}</v-icon
                        >
                    </template>
                    <span>{{ variable.description }}</span>
                </v-tooltip>

                <v-spacer></v-spacer>

                <v-icon x-large color="red" dense>mdi-tent</v-icon>
                <v-spacer></v-spacer>

                <v-icon x-large color="green" dense
                    >mdi-silverware-fork-knife
                </v-icon>
                <v-spacer></v-spacer>

                <v-icon x-large color="green" dense>mdi-shower-head </v-icon>
                <v-spacer></v-spacer>
            </v-col>
        </v-row>
        <v-row>
            <v-col class="d-flex justify-center mx-auto">
                <v-spacer></v-spacer>

                <v-icon x-large color="green" dense>mdi-food </v-icon>
                <v-spacer></v-spacer>
                <v-icon x-large color="red" dense>mdi-hanger </v-icon>
                <v-spacer></v-spacer>

                <v-icon x-large color="green" dense
                    >mdi-paper-roll-outline
                </v-icon>
                <v-spacer></v-spacer>

                <v-icon x-large color="green" dense>mdi-horse-human </v-icon>
                <v-spacer></v-spacer>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import VariableDTO from '@/models/VariableDTO';
import CenoteDTO from '@/models/CenoteDTO';
import RemoteServices from '@/services/RemoteServices';

@Component
export default class GeneralTab extends Vue {
    variables: VariableDTO[] = [];
    cenote: CenoteDTO | null = null;
    currentTab = 0;
    icons = {
        swimming: 'mdi-swim',
    };

    async created(): Promise<void> {
        await this.$store.dispatch('loading');
        try {
            this.variables = await RemoteServices.getData(
                this.$route.params.key,
                'TOURISM',
            );
        } catch (error) {
            await this.$store.dispatch('error', error);
        }
        await this.$store.dispatch('clearLoading');
    }
}
</script>

<style scoped lang="scss"></style>
