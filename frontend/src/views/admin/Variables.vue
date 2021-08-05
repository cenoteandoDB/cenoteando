<template>
    <v-data-table
        :headers="headers"
        :items="variables"
        :items-per-page="15"
        class="elevation-1"
    ></v-data-table>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import VariableDTO from '@/models/VariableDTO';
import RemoteServices from '@/services/RemoteServices';

@Component
export default class Variables extends Vue {
    headers = [
        { text: 'Name', value: 'name' },
        { text: 'Description', value: 'description' },
        { text: 'Theme', value: 'theme' },
        { text: 'Access Level', value: 'access_level' },
        { text: 'Timeseries', value: 'timeseries' },
        { text: 'Data type', value: 'type' },
    ];
    variables: VariableDTO[] = [];

    async created(): Promise<void> {
        await this.$store.dispatch('loading');

        (async () => {
            let generator = RemoteServices.variablesGenerator(
                500 /* TODO: Change to 15 after adding createdAt & updatedAt attributes */,
            );
            for await (let batch of generator) {
                if (!this.variables.length)
                    await this.$store.dispatch('clearLoading');

                batch.map((value) => {
                    console.log(value);
                });
                this.variables.push(...batch);
            }
        })().catch(async (error) => {
            await this.$store.dispatch('error', error);
        });
    }
}
</script>
