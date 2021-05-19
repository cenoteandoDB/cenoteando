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
        <l-circle-marker
            v-for="cenote in cenotes"
            :key="cenote.properties.code"
            :lat-lng="cenote.geometry.coordinates.slice().reverse()"
        ></l-circle-marker>
    </l-map>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import L from 'leaflet';
import { LCircleMarker, LMap, LTileLayer } from 'vue2-leaflet';
import 'leaflet/dist/leaflet.css';

import RemoteServices from '@/services/RemoteServices';
import CenoteDTO from '@/models/CenoteDTO';

@Component({
    components: {
        LMap,
        LTileLayer,
        LCircleMarker,
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
