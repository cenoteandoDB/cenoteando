<template>
    <v-container v-if="cenote">
        <v-row>
            <v-col>
                <h3>
                    {{ cenote.properties.name }}
                    <small>({{ cenote.properties.type }})</small>
                </h3>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-rating
                    :value="
                        cenote.properties.social
                            ? cenote.properties.social.rating
                            : null
                    "
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
                                cenote.geometry.coordinates.slice().reverse()
                            "
                            style="height: 400px"
                            @ready="$refs.marker.mapObject.openPopup()"
                        >
                            <l-tile-layer
                                :url="url"
                                :attribution="attribution"
                            ></l-tile-layer>
                            <map-marker
                                ref="marker"
                                :cenote="cenote"
                                :more="false"
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
                <v-sheet elevation="2" style="min-height: 500px">
                    <v-tabs>
                        <v-tab>General</v-tab>
                        <v-tab>Calculated Variables</v-tab>
                        <v-tab>Social</v-tab>
                        <v-tab>Thematic Data</v-tab>
                        <v-tab>Sources</v-tab>
                    </v-tabs>
                </v-sheet>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { LMap, LTileLayer, LCircleMarker } from 'vue2-leaflet';

import RemoteServices from '@/services/RemoteServices';
import CenoteDTO from '@/models/CenoteDTO';
import MapMarker from '@/components/map/MapMarker.vue';

@Component({
    components: {
        LMap,
        LTileLayer,
        LCircleMarker,
        MapMarker,
    },
})
export default class Cenote extends Vue {
    cenote: CenoteDTO | null = null;
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
