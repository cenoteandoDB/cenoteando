<template>
    <v-sheet elevation="2" style="min-height: 500px">
        <v-tabs fixed-tabs v-model="tab">
            <v-tabs-slider color="amber darken-3"></v-tabs-slider>
            <v-tab
                v-for="(item, index) in items"
                :class="{ active: currentTab === index }"
                @click="currentTab = index"
                :key="item"
            >
                {{ item }}
            </v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
            <v-card flat>
                <div v-show="currentTab === 0">
                    <v-card-text>General tab Content </v-card-text>
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
    items = [
        'General',
        'Calculated Variables',
        'Social',
        'Thematic Data',
        'Sources',
    ];
}
</script>

<style scoped lang="scss"></style>
