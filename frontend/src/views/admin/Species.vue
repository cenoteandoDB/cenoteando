<template>
    <v-card class="table">
        <v-data-table
            :headers="headers"
            :items="item"
            :items-per-page="15"
            :search="search"
            class="elevation-1"
        >
            <template v-slot:top>
                <v-card-title>
                    <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        label="Search"
                        class="mx-2"
                    />
                </v-card-title>

                <v-expansion-panels>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            Filters
                        </v-expansion-panel-header>

                        <v-expansion-panel-content>
                            <v-card-text>Template</v-card-text>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </template>

            <template v-slot:[`item.action`]="{ item }">
                <edit-user-dialog :user="item" @onSave="updateSpecie(item)">
                    <template v-slot:activator="{ on, attrs }">
                        <v-icon
                            class="mr-2 action-button"
                            v-on="on"
                            v-bind="attrs"
                            color="green"
                            data-cy="editUser"
                            >mdi-pencil</v-icon
                        >
                    </template>
                </edit-user-dialog>

                <delete-dialog @onConfirm="deleteSpecie(item)" />
            </template>
        </v-data-table>
    </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import RemoteServices from '@/services/RemoteServices';
import SpecieDTO from '@/models/SpecieDTO';
import FileService from '@/services/FileService';

@Component({
    components: {},
})
export default class Species extends Vue {
    files: File[] = [];
    uploadProgress = 0;
    headers = [
        { text: 'Cenoteando ID', value: '_key' },
        { text: 'Name', value: 'name' },
        { text: 'Naturalista ID', value: 'iNaturalistId' },
        { text: 'Alphia ID', value: 'aphiaId' },
        { text: 'Gbif ID', value: 'gbifId' },
    ];

    item = [];

    search = '';
    newSpecie = new SpecieDTO();

    species: SpecieDTO[] = [];

    async created(): Promise<void> {
        await this.$store.dispatch('loading');

        (async () => {
            let generator = RemoteServices.speciesGenerator(
                500 /* TODO: Change to 15 after adding createdAt & updatedAt attributes */,
            );
            for await (let batch of generator) {
                if (!this.species.length)
                    await this.$store.dispatch('clearLoading');

                this.species.push(...batch);
            }
        })().catch(async (error) => {
            await this.$store.dispatch('error', error);
        });
    }

    async createSpecie(): Promise<void> {
        await this.$store.dispatch('loading');

        try {
            await RemoteServices.updateSpecie(this.newSpecie);
        } catch (error) {
            await this.$store.dispatch('error', error);
        }

        await this.$store.dispatch('clearLoading');
        this.newSpecie = new SpecieDTO();
    }

    async updateSpecie(specie: SpecieDTO): Promise<void> {
        await this.$store.dispatch('loading');

        try {
            await RemoteServices.updateSpecie(specie);
        } catch (error) {
            // TODO: revert to original value in case of failure
            await this.$store.dispatch('error', error);
        }

        await this.$store.dispatch('clearLoading');
    }

    async deleteSpecie(specie: SpecieDTO): Promise<void> {
        await RemoteServices.deleteSpecie(specie._key);
        this.species = this.species.filter((s) => s._key != specie._key);
    }

    async download(): Promise<void> {
        await this.$store.dispatch('loading');

        try {
            const csv = await RemoteServices.speciesToCsv();
            FileService.download(csv, 'species.csv', 'text/csv');
        } catch (error) {
            await this.$store.dispatch('error', error);
        }

        await this.$store.dispatch('clearLoading');
    }
    selectFiles(files: File[]): void {
        this.uploadProgress = 0;
        this.files = files;
    }

    async upload(): Promise<void> {
        await this.$store.dispatch('loading');

        try {
            await RemoteServices.csvToVariables(this.files, (event) => {
                this.uploadProgress = Math.round(
                    (100 * event.loaded) / event.total,
                );
            });
        } catch (error) {
            this.uploadProgress = 0;
            await this.$store.dispatch('error', error);
        }

        await this.$store.dispatch('clearLoading');
    }
}
</script>
