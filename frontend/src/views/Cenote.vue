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
            <v-col>
                <v-carousel
                    show-arrows-on-hover
                    hide-delimiter-background
                    cycle
                >
                    <v-carousel-item
                        v-for="(image, i) in photos"
                        :key="i"
                        :src="image.src"
                        reverse-transition="fade-transition"
                        transition="fade-transition"
                    ></v-carousel-item>
                </v-carousel>
            </v-col>
            <v-col>
                <l-map
                    ref="map"
                    :zoom="zoom"
                    :options="mapOptions"
                    :center="
                        cenote.geojson.geometry.coordinates.slice().reverse()
                    "
                    style="min-height: 400px; min-width: 20vw; z-index: 0"
                >
                    <l-tile-layer
                        :url="url"
                        :attribution="attribution"
                    ></l-tile-layer>
                    <map-marker :cenote="cenote" :single="true"></map-marker>
                </l-map>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-carousel
                    hide-delimiter-background
                    show-arrows-on-hover
                    cycle
                >
                    <v-carousel-item
                        v-for="(image, i) in maps"
                        :key="i"
                        :src="image.src"
                        reverse-transition="fade-transition"
                        transition="fade-transition"
                    ></v-carousel-item>
                </v-carousel>
            </v-col>
            <v-col>
                <cenote-details />
                <v-row>
                    <v-col>
                        <v-expansion-panels>
                            <v-expansion-panel>
                                <v-expansion-panel-header>
                                    <v-icon>mdi-alert</v-icon>
                                    <v-subheader>Known Issues</v-subheader>
                                </v-expansion-panel-header>
                                <v-expansion-panel-content>
                                    <p
                                        v-for="issue in cenote.issues"
                                        :key="issue"
                                        class="text-center pt-5"
                                    >
                                        {{ issue }}
                                    </p>
                                </v-expansion-panel-content>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </v-col>
                </v-row>
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
import CenoteDetails from '@/components/cenote/CenoteDetails.vue';

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
    photos: Array<string> | null = null;
    maps: Array<string> | null = null;

    // photosTest = [
    //     {
    //         src: 'https://media.tacdn.com/media/attractions-splice-spp-674x446/06/7b/1e/ee.jpg',
    //     },
    //     {
    //         src: 'https://www.oyster.com/wp-content/uploads/sites/35/2019/05/17912-9696492595-0b73d63c88-o.jpg',
    //     },
    // ];

    // mapsTest = [
    //     {
    //         src: 'https://www.researchgate.net/profile/Dorottya-Angyal-2/publication/331176795/figure/fig1/AS:727864316010496@1550547784184/Map-of-the-cenote-distribution-in-the-Yucatan-state-Mexico-with-studied-localities-The.png',
    //     },
    //     {
    //         src: 'https://www.researchgate.net/profile/Jeremy-Stalker/publication/271631426/figure/fig5/AS:613445569359913@1523268229636/Ring-of-Cenote-groundwater-flow-map-Ring-of-Cenote-water-flows-to-the-coast-along-a.png',
    //     },
    // ];

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
            this.photos = await RemoteServices.getPhotosCenotes(
                this.$route.params.key,
            );
            this.maps = await RemoteServices.getMapsCenotes(
                this.$route.params.key,
            );
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
