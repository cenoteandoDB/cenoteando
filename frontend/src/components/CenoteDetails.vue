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
                    <v-container class="d-flex justify-center mb-6">
                        <v-icon x-large color="green" class="ma-5"
                            >mdi-swim</v-icon
                        >

                        <v-icon x-large color="red" class="mr-15"
                            >mdi-swim</v-icon
                        >
                    </v-container>
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
