<template>
    <l-map
        ref="map"
        :zoom="zoom"
        :bounds="bounds"
        :maxBounds="bounds"
        :options="mapOptions"
        class="fill-height"
    >
    <l-control-layers position="bottomright"  > </l-control-layers>
        <l-tile-layer
      v-for="tileProvider in tileProviders"
      :key="tileProvider.name"
      :name="tileProvider.name"
      :visible="tileProvider.visible"
      :url="tileProvider.url"
      :attribution="tileProvider.attribution"
      layer-type="base"/>

     <l-layer-group 
    :visible="sourceVisible"
    layer-type="overlay"
    name="Areas naturales protegidas"> 
    <l-geo-json :geojson="geojson"/>
    </l-layer-group>

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
import { LCircleMarker, LMap, LTileLayer, LIcon, LControlLayers, LGeoJson, LLayerGroup} from 'vue2-leaflet';
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

    data () {
    return {
    zoom : 9,
    geojson: null,
    url : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution :
        '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
    mapOptions : {
        zoomSnap: 0.5,
    },

    tileProviders: [
        {
          name: 'OpenStreetMap',
          visible: true,
          attribution:
            '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          geojson: null
        },
        {
          name: 'CyclOSM',
          visible: false,
          url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
          attribution:
            '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          geojson: null
        },
        {
          name: 'Sattelite',
          visible: false,
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution:
            'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          geojson: null
        },
        {
          name: 'Topologic',
          visible: false,
          url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          attribution:
            'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
          geojson: null
        },
        {
          name: 'Transport',
          visible: false,
          url: 'https://{s}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png?apikey={apikey}',
          attribution:
            '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          geojson: null
        },
        {
          name: 'Hike & Bike',
          visible: false,
          url: 'https://tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png',
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          geojson: null
        },
        {
          name: 'Nat Geo',
          visible: false,
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
          attribution:
            'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
          geojson: null
        },
        {
          name: 'Dark',
          visible: false,
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          geojson: null
        },
      ],
    };
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

        const response = await fetch('https://raw.githubusercontent.com/luisyerbes20/yerbaa/main/areas_naturales.json');
        this.geojson = await response.json();
    };
    //L.layerControl.addOverlay(data, geojson);

}
</script>
<style>
@import '~leaflet/dist/leaflet.css';
@import '~leaflet.markercluster/dist/MarkerCluster.css';
@import '~leaflet.markercluster/dist/MarkerCluster.Default.css';
</style>
