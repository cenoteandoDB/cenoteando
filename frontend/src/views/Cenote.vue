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
                        :src="image"
                        reverse-transition="fade-transition"
                        transition="fade-transition"
                        :width="600"
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
        <v-row class="flex-nowrap">
            <v-col>
                <v-carousel hide-delimiter-background show-arrows-on-hover>
                    <v-carousel-item
                        v-for="(image, i) in maps"
                        :key="i"
                        :src="image"
                        reverse-transition="fade-transition"
                        transition="fade-transition"
                        width="600"
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
import CenoteDetails from '@/components/cenote/CenoteDetails.vue';
import MapMarker from '@/components/map/MapMarker.vue';
import CenoteDTO from '@/models/CenoteDTO';
import RemoteServices from '@/services/RemoteServices';
import L from 'leaflet';
import { Component, Vue } from 'vue-property-decorator';
import { LCircleMarker, LMap, LTileLayer } from 'vue2-leaflet';


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
