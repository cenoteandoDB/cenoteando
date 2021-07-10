<template>
    <v-container>
        <v-card>
            <v-tabs v-model="tab" fixed-tabs>
                <v-tab v-for="tabs in tabs" :key="tabs">
                    {{ tabs }}
                </v-tab>
            </v-tabs>

            <v-tabs-items v-model="tab">
                <v-tab-item v-for="tabs in tabs" :key="tabs">
                    <v-card v-if="tabs === 'Location'" flat>
                        <location-tab />
                    </v-card>

                    <v-card v-if="tabs === 'Geo Reference'" flat>
                        <georef-tab />
                    </v-card>

                    <v-card v-if="tabs === 'Cultural'" flat>
                        <cultural-tab />
                    </v-card>

                    <v-card v-if="tabs === 'Geomorphology'" flat>
                        <geomorphology-tab />
                    </v-card>

                    <v-card v-if="tabs === 'Biodiversity'" flat>
                        <biodiversity-tab />
                    </v-card>

                    <v-card v-if="tabs === 'Disturbance'" flat>
                        <disturbance-tab />
                    </v-card>

                    <v-card v-if="tabs === 'Tourism'" flat>
                        <tourism-tab />
                    </v-card>

                    <v-card v-if="tabs === 'Diving'" flat>
                        <diving-tab />
                    </v-card>

                    <v-card v-if="tabs === 'Organization'" flat>
                        <organization-tab />
                    </v-card>

                    <v-card v-if="tabs === 'Regulation'" flat>
                        <regulation-tab />
                    </v-card>

                    <v-card v-if="tabs === 'Water'" flat>
                        <water-tab />
                    </v-card>
                </v-tab-item>
            </v-tabs-items>
        </v-card>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import VariableDTO from '@/models/VariableDTO';
import LocationTab from '@/components/cenote/thematicData/LocationTab.vue';
import GeorefTab from '@/components/cenote/thematicData/GeorefTab.vue';
import CulturalTab from '@/components/cenote/thematicData/CulturalTab.vue';
import GeomorphologyTab from '@/components/cenote/thematicData/GeomorphologyTab.vue';
import BiodiversityTab from '@/components/cenote/thematicData/BiodiversityTab.vue';
import DisturbanceTab from '@/components/cenote/thematicData/DisturbanceTab.vue';
import TourismTab from '@/components/cenote/thematicData/TourismTab.vue';
import DivingTab from '@/components/cenote/thematicData/DivingTab.vue';
import OrganizationTab from '@/components/cenote/thematicData/OrganizationTab.vue';
import RegulationTab from '@/components/cenote/thematicData/RegulationTab.vue';
import WaterTab from '@/components/cenote/thematicData/WaterTab.vue';

@Component({
    components: {
        LocationTab,
        GeorefTab,
        CulturalTab,
        GeomorphologyTab,
        BiodiversityTab,
        DisturbanceTab,
        TourismTab,
        DivingTab,
        OrganizationTab,
        RegulationTab,
        WaterTab,
    },
})
export default class ThematicData extends Vue {
    variables: VariableDTO[] = [];

    currentTab = 3;
    tab = null;
    tabs = [
        'Location',
        'Geo Reference',
        'Cultural',
        'Geomorphology',
        'Biodiversity',
        'Disturbance',
        'Tourism',
        'Diving',
        'Organization',
        'Regulation',
        'Water',
    ];
}
</script>

<style scoped lang="scss"></style>
