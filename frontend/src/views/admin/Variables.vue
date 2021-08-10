<template>
    <v-card class="table">
        <v-data-table
            :headers="headers"
            :items="variables"
            :items-per-page="15"
            class="elevation-1"
        >
            <template v-slot:[`item.action`]="{ item }">
                <edit-variable-dialog />

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-icon
                            class="mr-2 action-button"
                            v-on="on"
                            @click="deleteVariable(item)"
                            color="red"
                            data-cy="deleteVariable"
                            >mdi-delete-forever</v-icon
                        >
                    </template>
                    <span>Delete</span>
                </v-tooltip>
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

@Component({ components: { EditVariableDialog, DeleteDialog } })
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

                this.variables.push(...batch);
            }
        })().catch(async (error) => {
            await this.$store.dispatch('error', error);
        });
    }
}
</script>
