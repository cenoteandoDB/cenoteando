<template>
    <v-card class="table mx-8">
        <v-data-table
            :headers="headers"
            :items="filteredReferences"
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
                        <edit-reference-dialog
                            :reference="newReference"
                            @onSave="createReference()"
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
                        </edit-reference-dialog>

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
                                    <span class="text-h5"
                                        >Upload References</span
                                    >
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
                    </v-container>
                </v-card-title>
                <v-expansion-panels class="pa-5">
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            Filters
                        </v-expansion-panel-header>

                        <v-expansion-panel-content>
                            <v-select
                                v-model="filterType"
                                :items="types"
                                label="Type"
                                multiple
                                chips
                                hint="Reference Type"
                                persistent-hint
                            ></v-select>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </template>

            <template v-slot:[`item.action`]="{ item }">
                <v-container class="d-flex d-row">
                    <edit-reference-dialog
                        :reference="item"
                        @onSave="updateReference(item)"
                    >
                        <template v-slot:activator="{ on, attrs }">
                            <v-icon
                                class="mr-2 action-button"
                                v-on="on"
                                v-bind="attrs"
                                color="green"
                                data-cy="editReference"
                                >mdi-pencil</v-icon
                            >
                        </template>
                    </edit-reference-dialog>

                    <delete-dialog @onConfirm="deleteReference(item)" />

                    <v-icon
                        v-if="
                            item.filename !== '' ||
                            item.filename !== undefined ||
                            item.filename !== null
                        "
                        v-model="item.id"
                        @click="downloadReference(item)"
                        data-cy="downloadButton"
                        fab
                        color="primary"
                        >mdi-download</v-icon
                    >
                </v-container>
            </template>
        </v-data-table>
    </v-card>
</template>

<script lang="ts">
import DeleteDialog from '@/components/admin/DeleteDialog.vue';
import EditReferenceDialog from '@/components/admin/EditReferenceDialog.vue';
import ReferenceDTO from '@/models/ReferenceDTO';
import FileService from '@/services/FileService';
import RemoteServices from '@/services/RemoteServices';
import { Component, Vue } from 'vue-property-decorator';

@Component({
    components: {
        EditReferenceDialog,
        DeleteDialog,
    },
})
export default class References extends Vue {
    files: File[] = [];
    uploadProgress = 0;
    headers = [
        { text: 'Cenoteando ID', value: 'id' },
        { text: 'Authors', value: 'authors' },
        { text: 'Short Name', value: 'shortName' },
        { text: 'Type', value: 'type' },
        { text: 'Year', value: 'year' },
        { text: 'Actions', value: 'action' },
    ];
    types = [
        '',
        'BOOK',
        'BOOK_CHAPTER',
        'JOURNAL',
        'OTHER',
        'REPORT',
        'THESIS',
        'WEBPAGE',
    ];
    item = [];
    search = '';
    newReference = new ReferenceDTO();
    references: ReferenceDTO[] = [];
    filterType: string[] = [];

    get filteredReferences(): ReferenceDTO[] {
        return this.references.filter(
            (r) => !this.filterType.length || this.filterType.includes(r.type),
        );
    }

    async created(): Promise<void> {
        await this.$store.dispatch('loading');

        (async () => {
            let generator = RemoteServices.referencesGenerator(30);
            for await (let batch of generator) {
                if (!this.references.length)
                    await this.$store.dispatch('clearLoading');

                this.references.push(...batch);
            }
        })().catch(async (error) => {
            await this.$store.dispatch('error', error);
        });
    }

    async createReference(): Promise<void> {
        await this.$store.dispatch('loading');

        try {
            await RemoteServices.createReference(this.newReference);
        } catch (error) {
            await this.$store.dispatch('error', error);
        }

        await this.$store.dispatch('clearLoading');
        this.newReference = new ReferenceDTO();
    }

    async updateReference(reference: ReferenceDTO): Promise<void> {
        await this.$store.dispatch('loading');

        try {
            await RemoteServices.updateReference(reference);
        } catch (error) {
            // TODO: revert to original value in case of failure
            await this.$store.dispatch('error', error);
        }

        await this.$store.dispatch('clearLoading');
    }

    async deleteReference(reference: ReferenceDTO): Promise<void> {
        await RemoteServices.deleteReference(reference.id);
        this.references = this.references.filter((r) => r.id != reference.id);
    }

    async download(): Promise<void> {
        await this.$store.dispatch('loading');

        try {
            const csv = await RemoteServices.referencesToCsv();
            FileService.download(csv, 'references.csv', 'text/csv');
        } catch (error) {
            await this.$store.dispatch('error', error);
        }

        await this.$store.dispatch('clearLoading');
    }

    async downloadReference(reference: ReferenceDTO): Promise<void> {
        await this.$store.dispatch('loading');

        try {
            const csv = await RemoteServices.referencesToCsvSingle(
                reference.id,
            );

            FileService.download(csv, 'references.csv', 'text/csv');
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
            await RemoteServices.csvToReferences(this.files, (event) => {
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
