<template>
    <Map />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Map from '@/components/map/Map.vue';

@Component({
    components: { Map },
})
export default class Repository extends Vue {}
</script>
