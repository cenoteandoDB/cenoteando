<template>
    <leaflet-map />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import LeafletMap from '@/components/map/LeafletMap.vue';

@Component({
    components: { LeafletMap },
})
export default class Map extends Vue {}
</script>
