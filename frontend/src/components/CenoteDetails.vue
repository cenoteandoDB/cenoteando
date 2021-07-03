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
                <div v-show="currentTab === 0"><general-tab /></div>

                <div v-show="currentTab === 1"><c-variables /></div>
                <div v-show="currentTab === 2"><social-tab /></div>
                <div v-show="currentTab === 3"><thematic-data /></div>
                <div v-show="currentTab === 4"><sources /></div>
            </v-card>
        </v-tabs-items>
    </v-sheet>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import GeneralTab from '@/components/GeneralTab.vue';
import CVariables from '@/components/CVariables.vue';
import SocialTab from '@/components/SocialTab.vue';
import ThematicData from '@/components/ThematicData.vue';
import Sources from '@/components/Sources.vue';

@Component({
    components: { GeneralTab, CVariables, SocialTab, ThematicData, Sources },
})
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
