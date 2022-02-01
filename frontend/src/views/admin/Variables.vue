<template>
    <v-card class="table mx-8">
        <v-data-table
            :headers="headers"
            :items="filteredVariables"
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
                        <edit-variable-dialog
                            :variable="newVariable"
                            @onSave="createVariable()"
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
                        </edit-variable-dialog>
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
                                        >Upload variables</span
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
                                v-model="filterThemes"
                                :items="themes"
                                label="Theme"
                                multiple
                                chips
                                hint="Variable theme"
                                persistent-hint
                            ></v-select>

                            <v-select
                                v-model="filterAccessLevels"
                                :items="accessLevels"
                                label="Access Levels"
                                multiple
                                chips
                                hint="Variable access level"
                                persistent-hint
                            ></v-select>

                            <v-select
                                v-model="filterDataTypes"
                                :items="dataTypes"
                                label="Data Types"
                                multiple
                                chips
                                hint="Variable data types"
                                persistent-hint
                            ></v-select>

                            <v-select
                                v-model="filterTimeseries"
                                :items="timeseries"
                                label="Timeseries"
                                multiple
                                chips
                                hint="Timeseries or constant"
                                persistent-hint
                            ></v-select>
                            <v-select
                                v-model="filterMultiple"
                                :items="multiple"
                                label="Multiple"
                                multiple
                                chips
                                hint="Multiple or constant"
                                persistent-hint
                            ></v-select>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </template>

            <template v-slot:[`item.action`]="{ item }">
                <v-container class="d-flex">
                    <edit-variable-dialog
                        :variable="item"
                        @onSave="updateVariable(item)"
                    >
                        <template v-slot:activator="{ on, attrs }">
                            <v-icon
                                class="action-button"
                                :data-cy="'editVariable_' + item.id"
                                v-on="on"
                                v-bind="attrs"
                                color="green"
                                >mdi-pencil</v-icon
                            >
                        </template>
                    </edit-variable-dialog>

                    <delete-dialog @onConfirm="deleteVariable(item)" />
                </v-container>
            </template>
        </v-data-table>
    </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import VariableDTO from '@/models/VariableDTO';
import RemoteServices from '@/services/RemoteServices';
import EditVariableDialog from '@/components/admin/EditVariableDialog.vue';
import DeleteDialog from '@/components/admin/DeleteDialog.vue';
import FileService from '@/services/FileService';

@Component({
    components: {
        EditVariableDialog,
        DeleteDialog,
    },
})
export default class Variables extends Vue {
    files: File[] = [];
    uploadProgress = 0;
    headers = [
        { text: 'Variable ID', value: 'id' },
        { text: 'Name', value: 'name' },
        { text: 'Description', value: 'description' },
        { text: 'Theme', value: 'theme' },
        { text: 'Access Level', value: 'accessLevel' },
        { text: 'Data Type', value: 'type' },
        { text: 'Timeseries', value: 'timeseries' },
        { text: 'Multiple', value: 'multiple' },
        { text: 'Enum Values', value: 'enumValues' },
        { text: 'Units', value: 'units' },
        { text: 'Methodology', value: 'methodology' },
        { text: 'Actions', value: 'action' },
    ];

    themes = [
        'BIODIVERSITY',
        'CULTURAL',
        'DISTURBANCE',
        'DIVING',
        'EVENT',
        'GEOMORPHOLOGY',
        'GEOREFERENCE',
        'LOCATION',
        'ORGANIZATION',
        'REGULATION',
        'TOURISM',
        'WATER',
    ];
    accessLevels = ['PUBLIC', 'PRIVATE', 'SENSITIVE'];
    timeseries = [true, false];
    multiple = [true, false];
    dataTypes = [
        'BOOLEAN',
        'DATE',
        'ENUM',
        'NUMBER_WITH_UNITS',
        'STRING',
        'TEXT',
        'TIME',
        'UNITLESS_NUMBER',
    ];

    search = '';
    newVariable = new VariableDTO();
    filterThemes: string[] = [];
    filterAccessLevels: string[] = [];
    filterTimeseries: boolean[] = [];
    filterDataTypes: string[] = [];
    filterMultiple: boolean[] = [];

    variables: VariableDTO[] = [];

    get filteredVariables(): VariableDTO[] {
        return this.variables
            .filter(
                (v) =>
                    !this.filterThemes.length ||
                    this.filterThemes.includes(v.theme),
            )
            .filter(
                (v) =>
                    !this.filterAccessLevels.length ||
                    this.filterAccessLevels.includes(v.accessLevel),
            )
            .filter(
                (v) =>
                    !this.filterTimeseries.length ||
                    this.filterTimeseries.includes(v.timeseries),
            )
            .filter(
                (v) =>
                    !this.filterMultiple.length ||
                    this.filterMultiple.includes(v.multiple),
            )
            .filter(
                (v) =>
                    !this.filterDataTypes.length ||
                    this.filterDataTypes.includes(v.type),
            );
    }

    async created(): Promise<void> {
        await this.$store.dispatch('loading');

        (async () => {
            let generator = RemoteServices.variablesGenerator(30);
            for await (let batch of generator) {
                if (!this.variables.length)
                    await this.$store.dispatch('clearLoading');

                this.variables.push(...batch);
            }
        })().catch(async (error) => {
            await this.$store.dispatch('error', error);
        });
    }

    async createVariable(): Promise<void> {
        await this.$store.dispatch('loading');

        try {
            await RemoteServices.createVariable(this.newVariable);
        } catch (error) {
            await this.$store.dispatch('error', error);
        }

        await this.$store.dispatch('clearLoading');
        this.newVariable = new VariableDTO();
    }

    async updateVariable(variable: VariableDTO): Promise<void> {
        await this.$store.dispatch('loading');

        try {
            await RemoteServices.updateVariable(variable);
        } catch (error) {
            // TODO: revert to original value in case of failure
            await this.$store.dispatch('error', error);
        }

        await this.$store.dispatch('clearLoading');
    }

    async deleteVariable(variable: VariableDTO): Promise<void> {
        await RemoteServices.deleteVariable(variable.id);
        this.variables = this.variables.filter((v) => v.id != variable.id);
    }

    async download(): Promise<void> {
        await this.$store.dispatch('loading');

        try {
            const csv = await RemoteServices.variablesToCsv();
            FileService.download(csv, 'variables.csv', 'text/csv');
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
