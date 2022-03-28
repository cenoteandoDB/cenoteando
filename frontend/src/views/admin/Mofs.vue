<template>
    <v-card class="table">
        <v-container class="d-flex flex-row">
            <v-select
                :items="filteredCenotes()"
                v-model="selectedCenote"
                label="Select Cenote"
                solo
            >
            </v-select>
            <v-select
                :items="themes"
                v-model="selectedTheme"
                label="Select Theme"
                solo
            ></v-select>
        </v-container>

        <v-data-table
            v-if="selectedCenote && selectedTheme"
            :headers="headers"
            :items="variables.filter((v) => v.theme.includes(selectedTheme))"
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
                    </v-container>
                </v-card-title>
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
import EditReferenceDialog from '@/components/admin/EditReferenceDialog.vue';
import CenoteDTO from '@/models/CenoteDTO';
import VariableDTO from '@/models/VariableDTO';
import FileService from '@/services/FileService';
import RemoteServices from '@/services/RemoteServices';
import { Component, Vue } from 'vue-property-decorator';
import Cenote from '../Cenote.vue';

@Component({
    components: {
        EditReferenceDialog,
        DeleteDialog,
    },
})
export default class Mofs extends Vue {
    files: File[] = [];
    uploadProgress = 0;
    headers = [
        { text: 'Name', value: 'name' },
        { text: 'Origin', value: 'origin'},
        { text: 'Theme', value: 'theme' },
        { text: 'description', value: 'description'},
        { text: 'Access Level', value: 'accessLevel' },
        { text: 'Data Type', value: 'type' },
        { text: 'Timeseries', value: 'timeseries' },
        { text: 'Multiple', value: 'multiple' },
        { text: 'Enum Values', value: 'enumValues' },
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
    themeFlag = false;
    hasFile = [true, false];
    item = [];
    search = '';
    newVariable = new VariableDTO();
    variables: VariableDTO[] = [];
    cenotes: CenoteDTO[] = [];
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
