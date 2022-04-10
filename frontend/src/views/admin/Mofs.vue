<template>
    <v-card class="table">
        <v-container class="d-flex flex-row">
            <v-select
                :items="filteredCenotes()"
                v-model="selectedCenote"
                v-on:change="
                    () => {
                        this.selectedCenoteFlag = true;

                        if (this.selectedThemeFlag === true) {
                            getMofData();
                        }
                    }
                "
                label="Select Cenote"
                solo
            >
            </v-select>
            <v-select
                :items="themes"
                v-model="selectedTheme"
                v-on:change="
                    () => {
                        this.selectedThemeFlag = true;
                        if (this.selectedCenoteFlag === true) {
                            getMofData();
                        }
                    }
                "
                label="Select Theme"
                solo
            ></v-select>
        </v-container>

        <v-data-table
            v-if="selectedCenoteFlag === true && selectedThemeFlag === true"
            :headers="headers"
            :items="
                mofs.map((m) => {
                    m.variable['count'] = m.values.reduce(
                        (a, obj) => a + Object.keys(obj).length,
                        0,
                    );
                    return m.variable;
                })
            "
            :items-per-page="15"
            :search="search"
            class="elevation-1"
            v-on:change="
                () => {
                    this.selectedThemeFlag = true;
                }
            "
        >
            <template v-slot:top>
                <v-card-title class="flex-column">
                    <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        label="Search"
                        class="mx-2"
                    />
                    <v-spacer />
                    <v-container class="d-flex flex-row justify-center">
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
                                    <span class="text-h5">Upload Mofs</span>
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
            </template>

            <template v-slot:[`item.action`]="{ item }">
                <edit-mofs-dialog :mofs="item" @onSave="updateVariable(item)">
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
                </edit-mofs-dialog>
                <delete-dialog @onConfirm="deleteCenote(item.cenote)" />
            </template>
        </v-data-table>
    </v-card>
</template>
<style scoped>
.v-text-field {
    width: 400px;
}
</style>

<script lang="ts">
import DeleteDialog from '@/components/admin/DeleteDialog.vue';
import EditMofsDialog from '@/components/admin/EditMofsDialog.vue';
import CenoteDTO from '@/models/CenoteDTO';
import VariableDTO from '@/models/VariableDTO';
import FileService from '@/services/FileService';
import RemoteServices from '@/services/RemoteServices';
import { Component, Vue } from 'vue-property-decorator';
import Cenote from '../Cenote.vue';
import VariableWithValuesDTO from '@/models/VariableWithValuesDTO';

interface MofsData {
    id: string;
    values: string;
    theme: string;
}

@Component({
    components: {
        EditMofsDialog,
        DeleteDialog,
    },
})
export default class Mofs extends Vue {
    files: File[] = [];
    uploadProgress = 0;
    headers = [
        { text: 'Name', value: 'name' },
        { text: 'Description', value: 'description' },
        { text: 'Access Level', value: 'accessLevel' },
        { text: 'Data Type', value: 'type' },
        { text: 'Count', value: 'count' },
        { text: 'Actions', value: 'action' },
    ];

    themes = [
        'LOCATION',
        'GEOREFERENCE',
        'CULTURAL',
        'GEOMORPHOLOGY',
        'BIODIVERSITY',
        'DISTURBANCE',
        'TOURISM',
        'DIVING',
        'ORGANIZATION',
        'REGULATION',
        'WATER',
    ];
    selectedCenote = '';
    selectedTheme = '';
    selectedCenoteFlag = false;
    selectedThemeFlag = false;
    themeFlag = false;
    hasFile = [true, false];
    item = [];
    search = '';
    newVariable = new VariableDTO();
    newMofs = new VariableWithValuesDTO();
    variables: VariableDTO[] = [];
    cenotes: CenoteDTO[] = [];
    mofs: VariableWithValuesDTO[] = [];
    filterType: string[] = [];
    filterHasFile: boolean[] = [];

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
        await this.$store.dispatch('loading');

        (async () => {
            let generator = RemoteServices.cenotesGenerator(30);
            for await (let batch of generator) {
                if (!this.cenotes.length)
                    await this.$store.dispatch('clearLoading');
                this.cenotes.push(...batch);
            }
        })().catch(async (error) => {
            await this.$store.dispatch('error', error);
        });

        await this.$store.dispatch('loading');

        // (async () => {
        //     let generator = RemoteServices.mofsGenerator(30);
        //     for await (let batch of generator) {
        //         if (!this.mofs.length)
        //             await this.$store.dispatch('clearLoading');
        //         this.mofs.push(...batch);
        //     }
        // })().catch(async (error) => {
        //     await this.$store.dispatch('error', error);
        // });
    }

    cenoteToDisplay(cenote: CenoteDTO): string {
        return cenote.id + ' - ' + cenote.name;
    }

    filteredCenotes(): string[] {
        return this.cenotes.map(this.cenoteToDisplay);
    }

    cenoteDisplayToId(display: string): string {
        return display.split(' - ')[0];
    }

    async getMofData(): Promise<void> {
        await this.$store.dispatch('loading');

        try {
            if (this.selectedCenote && this.selectedTheme) {
                this.mofs = await RemoteServices.getData(
                    this.cenoteDisplayToId(this.selectedCenote),
                    this.selectedTheme,
                );
            }
        } catch (error) {
            await this.$store.dispatch('error', error);
        }

        await this.$store.dispatch('clearLoading');
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
        this.variables = this.variables.filter((r) => r.id != variable.id);
    }

    async download(): Promise<void> {
        await this.$store.dispatch('loading');

        try {
            const csv = await RemoteServices.variablesToCsv();
            FileService.download(csv, 'mofs.csv', 'text/csv');
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
