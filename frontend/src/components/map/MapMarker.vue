<template>
    <!-- TODO: :icon="marker_icon[cenote.properties.type]" -->
    <l-circle-marker :lat-lng="cenote.geometry.coordinates.slice().reverse()">
        <l-popup>
            <label>Name: {{ cenote.properties.name }}</label>
            <br />
            <label>Type: {{ cenote.properties.type }}</label>
            <br />
            <label>
                Touristic:
                <v-icon
                    v-if="cenote.properties.touristic"
                    dark
                    x-small
                    color="green"
                >
                    mdi-checkbox-marked
                </v-icon>
                <v-icon v-else dark x-small color="red">mdi-close-box</v-icon>
            </label>
            <br v-if="more" />
            <v-btn
                :to="'/cenote/' + cenote._key"
                v-if="more"
                x-small
                class="ma-1"
                color="primary"
                plain
            >
                More Info...
            </v-btn>
        </l-popup>
    </l-circle-marker>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { LPopup, LCircleMarker } from 'vue2-leaflet';
import CenoteDTO from '@/models/CenoteDTO';

@Component({
    components: {
        LPopup,
        LCircleMarker,
    },
    props: {
        cenote: CenoteDTO,
        more: Boolean,
    },
})
export default class MapMarker extends Vue {}
</script>

<style>
@import '~leaflet/dist/leaflet.css';
@import '~leaflet.markercluster/dist/MarkerCluster.css';
@import '~leaflet.markercluster/dist/MarkerCluster.Default.css';
</style>
