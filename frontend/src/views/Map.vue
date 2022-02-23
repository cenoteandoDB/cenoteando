<template>
    <leaflet-map />
</template>

<script lang="ts">
import LeafletMap from '@/components/map/LeafletMap.vue';
import { Component, Vue } from 'vue-property-decorator';

@Component({
    components: { LeafletMap },
})
export default class Map extends Vue {}
</script>
