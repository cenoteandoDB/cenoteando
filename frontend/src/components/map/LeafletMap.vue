<template>
    <l-map
        ref="map"
        :zoom="zoom"
        :bounds="bounds"
        :maxBounds="bounds"
        :options="mapOptions"
        class="fill-height"
    >
        <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
        <l-marker-cluster>
            <map-marker
                v-for="cenote in cenotes"
                :key="cenote.properties.code"
                :cenote="cenote"
                :more="true"
            >
            </map-marker>
        </l-marker-cluster>
    </l-map>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import L from 'leaflet';
import { LCircleMarker, LMap, LTileLayer, LIcon } from 'vue2-leaflet';
import Vue2LeafletMarkerCluster from 'vue2-leaflet-markercluster';

import RemoteServices from '@/services/RemoteServices';
import CenoteDTO from '@/models/CenoteDTO';
import MapMarker from '@/components/map/MapMarker.vue';

@Component({
    components: {
        LMap,
        LTileLayer,
        LCircleMarker,
        LIcon,
        'l-marker-cluster': Vue2LeafletMarkerCluster,
        MapMarker,
    },
})
export default class LeafletMap extends Vue {
    zoom = 9;
    url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    attribution =
        '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors';
    mapOptions = {
        zoomSnap: 0.5,
    };
    bounds: L.LatLngBounds | null = null;
    cenotes: Array<CenoteDTO> | null = null;

    async created(): Promise<void> {
        await this.$store.dispatch('loading');
        try {
            this.bounds = await RemoteServices.getCenotesBounds();
            this.cenotes = await RemoteServices.getAllCenotes();
        } catch (error) {
            await this.$store.dispatch('error', error);
        }
        await this.$store.dispatch('clearLoading');
    }
}
</script>

<style>
@import '~leaflet/dist/leaflet.css';
@import '~leaflet.markercluster/dist/MarkerCluster.css';
@import '~leaflet.markercluster/dist/MarkerCluster.Default.css';
</style>
