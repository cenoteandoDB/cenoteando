<template>
    <v-card class="table mx-8">
        <v-data-table
            :headers="headers"
            :items="species"
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
                    <v-spacer />

                    <v-container class="d-flex flex-row justify-center">
                        <edit-species-dialog
                            :species="newSpecie"
                            @onSave="createSpecie()"
                        >
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    v-on="on"
                                    v-bind="attrs"
                                    data-cy="createButton"
                                >
                                    <v-icon color="green">mdi-plus</v-icon>
                                </v-btn>
                            </template>
                        </edit-species-dialog>

                        <v-dialog max-width="600px">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    v-on="on"
                                    v-bind="attrs"
                                    data-cy="uploadButton"
                                    ><v-icon color="primary"
                                        >mdi-upload</v-icon
                                    ></v-btn
                                >
                            </template>
                            <v-card class="pt-5 mt-5 justify-center">
                                <v-card-title>
                                    <span class="text-h5">Upload Species </span>
                                </v-card-title>
                                <v-card-text>
                                    <v-form>
                                        <v-file-input
                                            @change="selectFiles"
                                            multiple
                                            counter
                                            show-size
                                            chips
                                            accept=".csv"
                                        />
                                    </v-form>
                                    <!-- TODO: Add progressbar
                                    <v-progress-linear
                                        :value="this.uploadProgress"
                                    ></v-progress-linear>
                                    -->
                                    <v-btn @click="upload">Upload</v-btn>
                                </v-card-text>
                            </v-card>
                        </v-dialog>

                        <v-btn @click="download" data-cy="downloadButton"
                            ><v-icon color="primary"
                                >mdi-download</v-icon
                            ></v-btn
                        >

                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                v-on="on"
                                v-bind="attrs"
                                data-cy="createButton"
                            >
                                <v-icon color="green">mdi-plus</v-icon>
                            </v-btn>
                        </template>
                    </v-container>
                </v-card-title>
            </template>

            <!-- TODO: Add edit and delete species actions -->
            <template v-slot:[`item.action`]="{ item }">
                <edit-species-dialog
                    :species="item"
                    @onSave="updateSpecie(item)"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-icon
                            class="mr-2 action-button"
                            v-on="on"
                            v-bind="attrs"
                            color="green"
                            data-cy="editSpecie"
                            >mdi-pencil</v-icon
                        >
                    </template>
                </edit-species-dialog>

                <delete-dialog @onConfirm="deleteSpecie(item)" />
            </template>
        </v-data-table>
    </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import RemoteServices from '@/services/RemoteServices';
import SpeciesDTO from '@/models/SpeciesDTO';
import FileService from '@/services/FileService';
import DeleteDialog from '@/components/admin/DeleteDialog.vue';
import EditSpeciesDialog from '@/components/admin/EditSpeciesDialog.vue';

@Component({
    components: {
        EditSpeciesDialog,
        DeleteDialog,
    },
})
export default class Species extends Vue {
    files: File[] = [];
    uploadProgress = 0;
    headers = [
        { text: 'Cenoteando ID', value: 'id' },
        { text: 'iNaturalist ID', value: 'iNaturalistId' },
        { text: 'Aphia ID', value: 'aphiaId' },
        { text: 'Actions', value: 'action' },
    ];

    item = [];

    search = '';
    newSpecie = new SpeciesDTO();

    species: SpeciesDTO[] = [];

    async created(): Promise<void> {
        await this.$store.dispatch('loading');

        (async () => {
            let generator = RemoteServices.speciesGenerator(30);
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
            await RemoteServices.createSpecie(this.newSpecie);
        } catch (error) {
            await this.$store.dispatch('error', error);
        }

        await this.$store.dispatch('clearLoading');
        this.newSpecie = new SpeciesDTO();
    }

    async updateSpecie(specie: SpeciesDTO): Promise<void> {
        await this.$store.dispatch('loading');

        try {
            await RemoteServices.updateSpecie(specie);
        } catch (error) {
            // TODO: revert to original value in case of failure
            await this.$store.dispatch('error', error);
        }

        await this.$store.dispatch('clearLoading');
    }

    async deleteSpecie(specie: SpeciesDTO): Promise<void> {
        await RemoteServices.deleteSpecie(specie.id);
        this.species = this.species.filter((s) => s.id != specie.id);
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
            await RemoteServices.csvToSpecies(this.files, (event) => {
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
