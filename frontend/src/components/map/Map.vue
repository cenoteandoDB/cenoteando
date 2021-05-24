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
            <l-circle-marker
                v-for="cenote in cenotes"
                :key="cenote.properties.code"
                :lat-lng="cenote.geometry.coordinates.slice().reverse()"
            >
                <!-- :icon="marker_icon" -->
                <l-popup :content="cenote.properties.name"></l-popup>
            </l-circle-marker>
        </l-marker-cluster>
    </l-map>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import L from 'leaflet';
import { LCircleMarker, LPopup, LMap, LTileLayer, LIcon } from 'vue2-leaflet';
import Vue2LeafletMarkerCluster from 'vue2-leaflet-markercluster';

import RemoteServices from '@/services/RemoteServices';
import CenoteDTO from '@/models/CenoteDTO';

@Component({
    components: {
        LMap,
        LTileLayer,
        LCircleMarker,
        LPopup,
        LIcon,
        'l-marker-cluster': Vue2LeafletMarkerCluster,
    },
})
export default class Map extends Vue {
    zoom = 9;
    url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    attribution =
        '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors';
    mapOptions = {
        zoomSnap: 0.5,
    };
    bounds: L.LatLngBounds | null = null;
    cenotes: Array<CenoteDTO> | null = null;
    marker_icon = L.icon({
        iconUrl: 'logo.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
    });

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
