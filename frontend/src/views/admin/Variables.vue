<template>
    <v-card class="table">
        <v-data-table
            :headers="headers"
            :items="variables"
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
                        :items="items"
                    />
                    <v-spacer />
                    <AddVariableDialog />
                    <v-btn @click="uploadButton" data-cy="uploadButton"
                        ><v-icon color="green">mdi-upload</v-icon></v-btn
                    >

                    <v-btn @click="downloadButton" data-cy="downloadButton"
                        ><v-icon color="green">mdi-download</v-icon></v-btn
                    >
                </v-card-title>

                <v-expansion-panels>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            Filters
                        </v-expansion-panel-header>

                        <v-expansion-panel-content>
                            <h4 class="pb-2">Theme</h4>
                            <v-chip> ORGANIZATION </v-chip>
                            <h4 class="pb-2 pt-2">Access Levels</h4>

                            <v-chip> SENSITIVE</v-chip>
                            <h4 class="pb-2 pt-2">Data Type</h4>

                            <v-chip> NO_TYPE</v-chip>

                            <v-checkbox
                                v-model="checkbox"
                                label="Timeseries"
                            ></v-checkbox>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </template>

            <template v-slot:[`item.action`]="{ item }">
                <edit-variable-dialog
                    :variable="item"
                    @onSave="updateVariable(item)"
                />

                <delete-dialog @onConfirm="deleteVariable(item)" />
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
import AddVariableDialog from '@/components/admin/AddVariableDialog.vue';

@Component({
    components: {
        EditVariableDialog,
        DeleteDialog,
        AddVariableDialog,
    },
})
export default class Variables extends Vue {
    headers = [
        { text: 'Name', value: 'name' },
        { text: 'Description', value: 'description' },
        { text: 'Theme', value: 'theme' },
        { text: 'Access Level', value: 'access_level' },
        { text: 'Timeseries', value: 'timeseries' },
        { text: 'Data type', value: 'type' },
        { text: 'Actions', value: 'action' },
    ];
    panel = [0, 1];
    readonly = false;

    search = '';
    variables: VariableDTO[] = [];
    dialog = false;

    async created(): Promise<void> {
        await this.$store.dispatch('loading');

        (async () => {
            let generator = RemoteServices.variablesGenerator(
                500 /* TODO: Change to 15 after adding createdAt & updatedAt attributes */,
            );
            for await (let batch of generator) {
                if (!this.variables.length)
                    await this.$store.dispatch('clearLoading');

                this.variables.push(...batch);
            }
        })().catch(async (error) => {
            await this.$store.dispatch('error', error);
        });
    }

    async updateVariable(variable: VariableDTO): Promise<void> {
        await RemoteServices.updateVariable(variable);
    }

    async deleteVariable(variable: VariableDTO): Promise<void> {
        await RemoteServices.deleteVariable(variable._key);
        this.variables = this.variables.filter((v) => v._key != variable._key);
    }
}
</script>
