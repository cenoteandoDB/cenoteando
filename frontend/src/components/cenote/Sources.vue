<template>
    <v-container>
        <ol>
            <li v-for="ref in references" :key="ref.id">
                <a
                    v-if="ref.hasFile"
                    :href="`/api/references/${ref.id}/download`"
                    target="_blank"
                    rel="noreferrer noopener"
                >
                    {{ ref.reference }}
                </a>
                <span v-else>{{ ref.reference }}</span>
            </li>
        </ol>
    </v-container>
</template>

<script lang="ts">
import ReferenceDTO from '@/models/ReferenceDTO';
import RemoteServices from '@/services/RemoteServices';
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Sources extends Vue {
    currentTab = 4;
    references: ReferenceDTO[] = [];

    async created(): Promise<void> {
        RemoteServices.getCenoteReferences(this.$route.params.key)
            .then((references) => (this.references = references))
            .catch((error) => this.$store.dispatch('error', error));
    }
}
</script>

<style scoped lang="scss"></style>
