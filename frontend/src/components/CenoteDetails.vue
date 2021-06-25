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
                    <v-container>
                        <v-row class="ml-10 mt-5" no-gutters>
                            <v-col>
                                <v-icon class="ml-10 mr-10 mt-5"
                                    >mdi-source-branch</v-icon
                                >
                            </v-col>
                            <v-col order="2">
                                <h3 class="ml-10 mr-10 mt-5">Kayak Rental</h3>
                            </v-col>
                            <v-col order="3">
                                <v-icon class="mt-5 ml-15" color="green"
                                    >mdi-check
                                </v-icon>
                            </v-col>
                        </v-row>
                    </v-container>
                    <v-container>
                        <v-row no-gutters class="ml-10 mt-5">
                            <v-col>
                                <v-icon class="ml-10 mt-5">mdi-swim</v-icon>
                            </v-col>
                            <v-col order="2">
                                <h3 class="ml-5 mr-5 mt-5">Swimming</h3>
                            </v-col>
                            <v-col order="3">
                                <v-icon class="mt-5 ml-15" color="green"
                                    >mdi-close
                                </v-icon>
                            </v-col>
                        </v-row>
                    </v-container>
                </div>
                <div v-show="currentTab === 1">
                    <v-card-text>Tab1 content</v-card-text>
                </div>
                <div v-show="currentTab === 2">
                    <v-card-text>Tab2 content</v-card-text>
                </div>
                <div v-show="currentTab === 3">
                    <v-card-text>Tab3 content</v-card-text>
                </div>
                <div v-show="currentTab === 4">
                    <v-card-text>Tab4 content</v-card-text>
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
