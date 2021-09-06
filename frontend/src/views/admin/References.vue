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
                <edit-user-dialog :user="item" @onSave="updateReference(item)">
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

                <delete-dialog @onConfirm="deleteReference(item)" />
            </template>
        </v-data-table>
    </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import RemoteServices from '@/services/RemoteServices';
import ReferenceDTO from '@/models/ReferenceDTO';
import FileService from '@/services/FileService';

@Component({
    components: {},
})
export default class References extends Vue {
    files: File[] = [];
    uploadProgress = 0;
    headers = [
        { text: 'Cenoteando ID', value: '_key' },
        { text: 'Authors', value: 'authors' },
        { text: 'File Name', value: 'fileName' },
        { text: 'Reference', value: 'reference' },
        { text: 'Short Name', value: 'shortName' },
        { text: 'Type', value: 'type' },
        { text: 'Year', value: 'year' },
    ];

    item = [];

    search = '';
    newReference = new ReferenceDTO();

    references: ReferenceDTO[] = [];

    async created(): Promise<void> {
        await this.$store.dispatch('loading');

        (async () => {
            let generator = RemoteServices.referencesGenerator(
                500 /* TODO: Change to 15 after adding createdAt & updatedAt attributes */,
            );
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
            await RemoteServices.updateReference(this.newReference);
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
        await RemoteServices.deleteReference(reference._key);
        this.references = this.references.filter(
            (r) => r._key != reference._key,
        );
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
