<template>
    <v-container>
        <v-row class="pt-10">
            <v-col class="d-flex justify-center">
                <v-spacer></v-spacer>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-icon
                            x-large
                            color="green"
                            v-bind="attrs"
                            v-on="on"
                            dense
                            >mdi-swim</v-icon
                        >
                    </template>
                    <span>Swimming available</span>
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

@Component
export default class GeneralTab extends Vue {
    variable: VariableDTO | null = null;
    cenote: CenoteDTO | null = null;
    currentTab = 0;
}
</script>

<style scoped lang="scss"></style>
