<template>
    <l-map
        ref="map"
        :zoom="zoom"
        :bounds="bounds"
        :maxBounds="bounds"
        :options="mapOptions"
        class="fill-height"
    >
        <l-control-layers position="topright"> </l-control-layers>
        <l-tile-layer
            v-for="tileProvider in tileProviders"
            :key="tileProvider.name"
            :name="tileProvider.name"
            :visible="tileProvider.visible"
            :url="tileProvider.url"
            :options="tileProvider.options"
            layer-type="base"
        />

        <l-geo-json
            v-for="(overlay, name) in overlays"
            :key="name"
            :name="name"
            :visible="overlay.visible || false"
            :geojson="overlay.geojson"
            layer-type="overlay"
        />

        <l-marker-cluster>
            <map-marker
                v-for="cenote in cenotes"
                :key="cenote.properties.code"
                :cenote="cenote"
                :single="false"
            >
            </map-marker>
        </l-marker-cluster>
    </l-map>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import L from 'leaflet';
import {
    LCircleMarker,
    LMap,
    LTileLayer,
    LIcon,
    LControlLayers,
    LGeoJson,
    LLayerGroup,
} from 'vue2-leaflet';
import Vue2LeafletMarkerCluster from 'vue2-leaflet-markercluster';
import { GeoJSON } from 'geojson';

import RemoteServices from '@/services/RemoteServices';
import CenoteDTO from '@/models/CenoteDTO';
import MapMarker from '@/components/map/MapMarker.vue';

interface Overlays {
    [key: string]: {
        geojson: GeoJSON;
        visible?: boolean;
    };
}

@Component({
    components: {
        LMap,
        LTileLayer,
        LControlLayers,
        LGeoJson,
        LCircleMarker,
        LLayerGroup,
        LIcon,
        'l-marker-cluster': Vue2LeafletMarkerCluster,
        MapMarker,
    },
})
export default class LeafletMap extends Vue {
    zoom = 9;
    mapOptions = {
        zoomSnap: 0.5,
    };
    tileProviders = [
        {
            name: 'OpenStreetMap',
            visible: true,
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            options: {
                maxZoom: 19,
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            },
        },
        {
            name: 'Detail',
            visible: false,
            url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
            options: {
                maxZoom: 20,
                attribution:
                    '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            },
        },
        {
            name: 'Sattelite',
            visible: false,
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            options: {
                attribution:
                    'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            },
        },
        {
            name: 'Topologic',
            visible: false,
            url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
            options: {
                maxZoom: 17,
                attribution:
                    'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
            },
        },
        /* TODO: Needs api key
        {
            name: 'Transport',
            visible: false,
            url: 'https://{s}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png?apikey=' + thunderforestApiKey,
            options: {
                apikey: '<your apikey>',
	            maxZoom: 22,
                attribution:
                    '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        },
        },
        */
        {
            name: 'Hike & Bike',
            visible: false,
            url: 'https://tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png',
            options: {
                maxZoom: 19,
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            },
        },
        {
            name: 'Nat Geo',
            visible: false,
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
            options: {
                maxZoom: 16,
                attribution:
                    'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
            },
        },
        {
            name: 'Dark',
            visible: false,
            url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            options: {
                subdomains: 'abcd',
                maxZoom: 19,
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            },
        },
    ];

    bounds: L.LatLngBounds | null = null;
    cenotes: Array<CenoteDTO> | null = null;
    overlays: Overlays = {};

    async created(): Promise<void> {
        await this.$store.dispatch('loading');
        try {
            this.bounds = await RemoteServices.getCenotesBounds();
            this.cenotes = await RemoteServices.getAllCenotes();
            RemoteServices.getProtectedNaturalAreas().then((geojson) => {
                this.$set(this.overlays, 'Protected Natural Areas', {
                    geojson,
                });
            });
            RemoteServices.getStates().then((geojson) => {
                this.$set(this.overlays, 'States', { geojson });
            });
            /* TODO: Implement this
            RemoteServices.getMunicipalities().then((geojson) => {
                this.$set(this.overlays, 'Municipalities', { geojson });
            });
            */
            RemoteServices.getMinTemperature().then((geojson) => {
                this.$set(this.overlays, 'Min Temperature', { geojson });
            });
            RemoteServices.getMaxTemperature().then((geojson) => {
                this.$set(this.overlays, 'Max Temperature', { geojson });
            });
            RemoteServices.getRoads().then((geojson) => {
                this.$set(this.overlays, 'Roads', { geojson });
            });
            RemoteServices.getSoilType().then((geojson) => {
                this.$set(this.overlays, 'Soil Type', { geojson });
            });
            RemoteServices.getTermRegime().then((geojson) => {
                this.$set(this.overlays, 'Term Regime', { geojson });
            });
            /* TODO: Implement this
            RemoteServices.getVegetation().then((geojson) => {
                this.$set(this.overlays, 'Vegetation Type', { geojson });
            });
            */
        } catch (error) {
            await this.$store.dispatch('error', error);
        }
        await this.$store.dispatch('clearLoading');
    }
}
</script>

<style scoped>
@import '~leaflet/dist/leaflet.css';
@import '~leaflet.markercluster/dist/MarkerCluster.css';
@import '~leaflet.markercluster/dist/MarkerCluster.Default.css';
</style>
