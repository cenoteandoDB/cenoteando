<template>
    <v-sheet elevation="2" style="min-height: 500px">
        <v-tabs fixed-tabs v-model="tab">
            <v-tabs-slider color="amber darken-3"></v-tabs-slider>
            <v-tab
                v-for="(tab, index) in tabs"
                :class="{ active: currentTab === index }"
                @click="currentTab = index"
                :key="tab"
            >
                {{ tab }}
            </v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
            <v-card flat>
                <div v-show="currentTab === 0">
                    <v-row class="pt-10">
                        <v-col class="d-flex justify-center">
                            <v-spacer></v-spacer>

                            <v-icon x-large color="green" dense
                                >mdi-swim</v-icon
                            >
                            <v-spacer></v-spacer>
                            <v-icon x-large color="red" dense>mdi-tent</v-icon>
                            <v-spacer></v-spacer>

                            <v-icon x-large color="green" dense
                                >mdi-silverware-fork-knife
                            </v-icon>
                            <v-spacer></v-spacer>

                            <v-icon x-large color="green" dense
                                >mdi-shower-head
                            </v-icon>
                            <v-spacer></v-spacer>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="d-flex justify-center mx-auto">
                            <v-spacer></v-spacer>

                            <v-icon x-large color="green" dense
                                >mdi-food
                            </v-icon>
                            <v-spacer></v-spacer>
                            <v-icon x-large color="red" dense
                                >mdi-hanger
                            </v-icon>
                            <v-spacer></v-spacer>

                            <v-icon x-large color="green" dense
                                >mdi-paper-roll-outline
                            </v-icon>
                            <v-spacer></v-spacer>

                            <v-icon x-large color="green" dense
                                >mdi-horse-human
                            </v-icon>
                            <v-spacer></v-spacer>
                        </v-col>
                    </v-row>
                </div>
                <div v-show="currentTab === 1">
                    <v-card-text>Content</v-card-text>
                </div>
                <div v-show="currentTab === 2">
                    <v-card-text>Content</v-card-text>
                </div>
                <div v-show="currentTab === 3">
                    <v-card-text>Content</v-card-text>
                </div>
                <div v-show="currentTab === 4">
                    <v-card-text>Content</v-card-text>
                </div>
            </v-card>
        </v-tabs-items>
    </v-sheet>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class CenoteDetails extends Vue {
    currentTab = 0;
    tab = null;
    tabs = [
        'General',
        'Calculated Variables',
        'Social',
        'Thematic Data',
        'Sources',
    ];
}
</script>

<style scoped lang="scss"></style>
