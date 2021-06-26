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
            v-for= "over in overlays"
            :geojson="over.gjson"
            :key="over.name"
            :name="over.name"
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
import L, { GeoJSON } from 'leaflet';
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

import RemoteServices from '@/services/RemoteServices';
import CenoteDTO from '@/models/CenoteDTO';
import MapMarker from '@/components/map/MapMarker.vue';

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
    // TODO: Add options and remove attribution for each provider as defined in https://leaflet-extras.github.io/leaflet-providers/preview/index.html
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
    protectedNaturalAreas: GeoJSON | null = null;
    states: GeoJSON | null = null;
    municipalities: GeoJSON | null = null;
    minTemperature: GeoJSON | null = null;
    maxTemperature: GeoJSON | null = null;
    roads: GeoJSON | null = null;
    soilType: GeoJSON | null = null;
    vegetation: GeoJSON | null = null;
    termRegime: GeoJSON | null = null;

    async created(): Promise<void> {
        await this.$store.dispatch('loading');
        try {
            this.bounds = await RemoteServices.getCenotesBounds();
            this.cenotes = await RemoteServices.getAllCenotes();
            this.protectedNaturalAreas = await RemoteServices.getProtectedNaturalAreas();
            this.states = await RemoteServices.getStates();
            this.municipalities = await RemoteServices.getMunicipalities();
            this.minTemperature = await RemoteServices.getMinTemperature();
            this.maxTemperature = await RemoteServices.getMaxTemperature();
            this.roads = await RemoteServices.getRoads();
            this.soilType = await RemoteServices.getSoilType();
            this.vegetation = await RemoteServices.getVegetation();
            this.termRegime = await RemoteServices.getTermRegime();
        } catch (error) {
            await this.$store.dispatch('error', error);
        }
        await this.$store.dispatch('clearLoading');
    }
    overlays=[{name: 'Protected Natural Areas', gjson: this.protectedNaturalAreas},
    {name: 'States', gjson: this.states},
    {name: 'Municipalities', gjson: this.municipalities},
    {name: 'Term Regime', gjson: this.termRegime},
    {name: 'Min Temperature', gjson: this.minTemperature},
    {name: 'Max Temperature', gjson: this.maxTemperature},
    {name: 'Roads', gjson: this.roads},
    {name: 'Soil Type', gjson: this.soilType},
    {name: 'Vegetation Type', gjson: this.vegetation},]
}
</script>
<style>
@import '~leaflet/dist/leaflet.css';
@import '~leaflet.markercluster/dist/MarkerCluster.css';
@import '~leaflet.markercluster/dist/MarkerCluster.Default.css';
</style>
