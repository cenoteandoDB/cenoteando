<template>
    <v-container class="mt-10">
        <v-row class="mb-10">
            <h2>List of Identifiers</h2>
        </v-row>
        <v-banner class="mb-10">
            <h4>
                Results fetched
                <small
                    >{{ index }} - {{ index + offset }} of
                    {{ identifiers.length }}</small
                >
            </h4>
            <h5 class="float-right">
                Response Date <small>{{ response_date }}</small>
            </h5>
        </v-banner>
        <v-card
            v-for="identifier in identifiers"
            v-bind:key="identifier.id"
            class="mb-10"
        >
            <div class="col-lg-4">
                <h5>
                    Identifier <small>{{ identifier.id }}</small>
                </h5>
            </div>
            <div class="col-lg-4">
                <h5>
                    Last Modified <small>{{ identifier.last_modified }}</small>
                </h5>
            </div>
        </v-card>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import RemoteServices from '@/services/RemoteServices';
import { Identifier } from '@/models/ListIdentifiersDTO';

@Component
export default class OaiListIdentifiers extends Vue {
    // TODO: Change this
    response_date = '2021-05-14 03:58:32';
    index = 0;
    offset = 100;
    identifiers: Array<Identifier> = [];

    async created(): Promise<void> {
        await this.$store.dispatch('loading');
        try {
            const listIdentifiersDTO = await RemoteServices.listIdentifiers();
            this.identifiers = listIdentifiersDTO.identifiers;
        } catch (error) {
            await this.$store.dispatch('error', error);
        }
        await this.$store.dispatch('clearLoading');
    }
}
</script>
