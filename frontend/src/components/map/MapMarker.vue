<template>
    <!-- TODO: :icon="marker_icon[cenote.properties.type]" -->
    <l-circle-marker
        ref="marker"
        :lat-lng="cenote.geojson.geometry.coordinates.slice().reverse()"
    >
        <l-popup>
            <label class="font-weight-bold text-center">
                <h2 class="mb-1">{{ cenote.name }}</h2></label
            >

            <label>Type: {{ cenote.type }}</label>
            <br />
            <label>
                Touristic:
                <v-icon v-if="cenote.touristic" dark x-small color="green">
                    mdi-checkbox-marked
                </v-icon>
                <v-icon v-else dark x-small color="red">mdi-close-box</v-icon>
            </label>
            <br v-if="!single" />
            <v-btn
                :to="'/cenote/' + cenote.id"
                v-if="!single"
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
import CenoteDTO from '@/models/CenoteDTO';
import { Component, Vue } from 'vue-property-decorator';
import { LCircleMarker, LPopup } from 'vue2-leaflet';

@Component({
    components: {
        LPopup,
        LCircleMarker,
    },
    props: {
        cenote: CenoteDTO,
        single: Boolean,
    },
})
export default class MapMarker extends Vue {
    mounted(): void {
        this.$nextTick(() => {
            if (this.$props.single)
                (this.$refs.marker as LCircleMarker).mapObject.openPopup();
        });
    }
}
</script>

<style scoped>
@import '~leaflet/dist/leaflet.css';
@import '~leaflet.markercluster/dist/MarkerCluster.css';
@import '~leaflet.markercluster/dist/MarkerCluster.Default.css';
</style>
