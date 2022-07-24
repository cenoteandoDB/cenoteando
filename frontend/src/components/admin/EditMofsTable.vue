<template>
    <v-dialog v-model="dialog" max-width="1000px">
        <template v-slot:activator="{ on, attrs }">
            <slot name="activator" v-bind:on="on" v-bind:attrs="attrs"> </slot>
        </template>

        <v-card class="pt-5 mt-5 justify-center">
            <v-card-title>
                <span class="text-h6">{{ mofs.name }}</span>
            </v-card-title>
            <v-container class="justify-center">
                <v-data-table
                    :headers="headers"
                    :items="[mofs]"
                    :items-per-page="5"
                    :search="search"
                    class="elevation-1"
                >
                    <template v-slot:top>
                        <v-container class="row justify-center">
                            <v-card-title class="flex-column">
                                <v-text-field
                                    v-model="search"
                                    append-icon="mdi-magnify"
                                    label="Search"
                                    class="mx-2"
                                />
                                <edit-mofs-var-dialog
                                    :mofs="mofs"
                                    :variable="variables"
                                    :key="mofs.key"
                                    :theme="mofs.theme"
                                >
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn
                                            v-on="on"
                                            v-bind="attrs"
                                            data-cy="createButton"
                                        >
                                            <v-icon color="green"
                                                >mdi-plus</v-icon
                                            >
                                        </v-btn>
                                    </template>
                                </edit-mofs-var-dialog>
                            </v-card-title>
                        </v-container>
                    </template>

                    <template v-slot:[`item.action`]="{ item }">
                        <delete-dialog @onConfirm="deleteMofs(item.mofs)" />
                    </template>
                </v-data-table>
            </v-container>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="dialog = false">
                    Close
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script lang="ts">
import VariableWithValuesDTO from '@/models/VariableWithValuesDTO';
import VariableDTO from '@/models/VariableDTO';
import { Component, Vue } from 'vue-property-decorator';
import EditMofsVarDialog from '@/components/admin/EditMofsVarDialog.vue';
import DeleteDialog from '@/components/admin/DeleteDialog.vue';
import RemoteServices from '@/services/RemoteServices';
import MofDTO from '@/models/MofDTO';

@Component({
    components: {
        EditMofsVarDialog,
        DeleteDialog,
    },
    props: {
        mofs: {},
        selectedCenote: {},
        selectedTheme: {},
    },
})
export default class EditMofsTable extends Vue {
    editName = false;
    dialog = false;
    valid = false;
    search = '';
    variables: VariableDTO[] = [];

    headers = [
        { text: 'Value', value: 'value' },
        { text: 'Timestamp', value: 'timestamp' },
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
    dataTypes = [
        'TEXT',
        'BOOLEAN',
        'ENUM',
        'JSON',
        'UNITLESS_NUMBER',
        'NUMBER_WITH_UNITS',
        'DATETIME',
        'DATE',
        'TIME',
    ];
    accessLevels = ['PUBLIC', 'PRIVATE', 'SENSITIVE'];

    async deleteCenote(mofs: MofDTO): Promise<void> {
        await RemoteServices.deleteMof(mofs);
        this.$props.mofs = this.$props.mofs.filter((v) => v.cenoteId != this.$props.mofs.cenoteId);
    }
    

    remove(item: string): void {
        this.$props.mofs.enumValues.splice(
            this.$props.mofs.enumValues.indexOf(item),
            1,
        );
    }
}
</script>
