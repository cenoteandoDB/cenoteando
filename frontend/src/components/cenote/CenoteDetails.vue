<template>
    <v-sheet elevation="2" style="min-height: 500px">
        <v-tabs v-model="currentTab" fixed-tabs slider-color="amber darken-3">
            <v-tab v-for="tab in tabs" :key="tab.tab">
                {{ tab.tab }}
            </v-tab>

            <v-tabs-items v-model="currentTab">
                <v-tab-item v-for="tab in tabs" :key="tab.tab">
                    <component :is="tab.component" />
                </v-tab-item>
            </v-tabs-items>
        </v-tabs>
    </v-sheet>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import GeneralTab from '@/components/cenote/GeneralTab.vue';
import CalculatedVariables from '@/components/cenote/CalculatedVariables.vue';
import SocialTab from '@/components/cenote/SocialTab.vue';
import ThematicData from '@/components/cenote/ThematicData.vue';
import Sources from '@/components/cenote/Sources.vue';
import CenoteDTO from '@/models/CenoteDTO';

const CenoteProps = Vue.extend({
    props: {
        cenote: CenoteDTO,
    },
});

@Component({
    components: {
        GeneralTab,
        CalculatedVariables,
        SocialTab,
        ThematicData,
        Sources,
    },
})
export default class CenoteDetails extends CenoteProps {
    currentTab = null;
    tabs = [
        { tab: 'General', component: 'GeneralTab' },
        { tab: 'Calculated Variables', component: 'CalculatedVariables' },
        { tab: 'Social', component: 'SocialTab' },
        { tab: 'Thematic Data', component: 'ThematicData' },
        { tab: 'Sources', component: 'Sources' },
    ];
}
</script>

<style scoped lang="scss"></style>
