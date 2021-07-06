<template>
    <v-container v-if="cenote">
        <v-row>
            <v-col>
                <h3>
                    {{ cenote.name }}
                    <small>({{ cenote.type }})</small>
                </h3>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-rating
                    :value="cenote.social ? cenote.social.rating : null"
                    readonly
                >
                </v-rating>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" md="6">
                <v-row>
                    <v-col>
                        <l-map
                            ref="map"
                            :zoom="zoom"
                            :options="mapOptions"
                            :center="
                                cenote.geojson.geometry.coordinates
                                    .slice()
                                    .reverse()
                            "
                            style="height: 400px"
                        >
                            <l-tile-layer
                                :url="url"
                                :attribution="attribution"
                            ></l-tile-layer>
                            <map-marker
                                :cenote="cenote"
                                :single="true"
                            ></map-marker>
                        </l-map>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-expansion-panels>
                            <v-expansion-panel>
                                <v-expansion-panel-header>
                                    <v-icon>mdi-alert</v-icon>
                                    <v-subheader>Known Issues</v-subheader>
                                </v-expansion-panel-header>
                                <v-expansion-panel-content>
                                    <!-- TODO: Populate with cenote issues -->
                                </v-expansion-panel-content>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </v-col>
                </v-row>
            </v-col>
            <v-col cols="12" md="6">
                <cenote-details />
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import L from 'leaflet';
import { LMap, LTileLayer, LCircleMarker } from 'vue2-leaflet';

import RemoteServices from '@/services/RemoteServices';
import CenoteDTO from '@/models/CenoteDTO';
import MapMarker from '@/components/map/MapMarker.vue';
import CenoteDetails from '@/components/CenoteDetails.vue';
import VariableDTO from '@/models/VariableDTO';

@Component({
    components: {
        LMap,
        LTileLayer,
        LCircleMarker,
        MapMarker,
        CenoteDetails,
    },
})
export default class Cenote extends Vue {
    marker: L.CircleMarker | null = null;
    cenote: CenoteDTO | null = null;
    variable: VariableDTO | null = null;

    zoom = 12;
    url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    attribution =
        '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors';
    mapOptions = {
        zoomSnap: 0.5,
    };

    async created(): Promise<void> {
        await this.$store.dispatch('loading');
        try {
            this.cenote = await RemoteServices.getCenote(
                this.$route.params.key,
            );
        } catch (error) {
            await this.$store.dispatch('error', error);
        }
        await this.$store.dispatch('clearLoading');
    }
}
</script>

<style lang="scss" scoped>
@import '~leaflet/dist/leaflet.css';
@import '~leaflet.markercluster/dist/MarkerCluster.css';
@import '~leaflet.markercluster/dist/MarkerCluster.Default.css';
</style>
