<template>
    <v-sheet elevation="2" style="min-height: 500px">
        <v-tabs v-model="tab" fixed-tabs>
            <v-tabs-slider color="amber darken-3"></v-tabs-slider>

            <v-tab v-for="tabs in tabs" :key="tabs">
                {{ tabs }}
            </v-tab>
        </v-tabs>

        <v-tabs-items v-model="tab">
            <v-tab-item v-for="tabs in tabs" :key="tabs">
                <v-card v-if="tabs === 'General'" flat>
                    <general-tab />
                </v-card>
                <v-card v-if="tabs === 'Calculated Variables'" flat>
                    <c-variables />
                </v-card>
                <v-card v-if="tabs === 'Social'" flat>
                    <social-tab />
                </v-card>
                <v-card v-if="tabs === 'Thematic Data'" flat>
                    <thematic-data />
                </v-card>
                <v-card v-if="tabs === 'Sources'" flat>
                    <sources />
                </v-card>
            </v-tab-item>
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
import CenoteDTO from '@/models/CenoteDTO';

const CenoteProps = Vue.extend({
    props: {
        cenote: CenoteDTO,
    },
});

@Component({
    components: { GeneralTab, CVariables, SocialTab, ThematicData, Sources },
})
export default class CenoteDetails extends CenoteProps {
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
