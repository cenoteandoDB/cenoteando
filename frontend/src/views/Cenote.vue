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
                            style="height: 400px; z-index: 0"
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
                <v-col>
                    <v-carousel hide-delimiters>
                        <v-carousel-item
                            v-for="(image, i) in images"
                            :key="i"
                            :src="image.pictures"
                        ></v-carousel-item>
                    </v-carousel>
                </v-col>
                <v-col>
                    <v-carousel hide-delimiters>
                        <v-carousel-item
                            v-for="(image, i) in images"
                            :key="i"
                            :src="image.maps"
                        ></v-carousel-item>
                    </v-carousel>
                </v-col>
            </v-col>
            <v-col cols="12" md="6">
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

    // images = {
    //     pictures: [
    //         'https://media.tacdn.com/media/attractions-splice-spp-674x446/06/7b/1e/ee.jpg',
    //         'https://1.bp.blogspot.com/-L3if49qKYa4/WTBmY67sKMI/AAAAAAAArBE/FUCA3JwrcDA5wikNbd41ebTq-ZI-hoUbgCLcB/s1600/CENOTEME%25CC%2581XICO.png',
    //     ],
    //     maps: [
    //         'https://www.researchgate.net/profile/Dorottya-Angyal-2/publication/331176795/figure/fig1/AS:727864316010496@1550547784184/Map-of-the-cenote-distribution-in-the-Yucatan-state-Mexico-with-studied-localities-The.png',
    //         'https://nsscds.org/wp-content/uploads/images/products/p-2349-2015_10_16_12.02.12__90546.1445210020.1280.1280.jpg',
    //     ],
    // };

    images = [
        {
            pictures:
                'https://media.tacdn.com/media/attractions-splice-spp-674x446/06/7b/1e/ee.jpg',
            maps: 'https://www.researchgate.net/profile/Dorottya-Angyal-2/publication/331176795/figure/fig1/AS:727864316010496@1550547784184/Map-of-the-cenote-distribution-in-the-Yucatan-state-Mexico-with-studied-localities-The.png',
        },
    ];

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
