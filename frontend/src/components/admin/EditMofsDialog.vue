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
                    class="elevation-1"
                >
                    <template v-slot:top>
                        <v-card-title class="flex-column">
                            <v-text-field
                                v-model="search"
                                append-icon="mdi-magnify"
                                label="Search"
                                class="mx-2"
                            />
                        </v-card-title>
                    </template>
                    <template v-slot:[`item.action`]="{ item }">
                        <edit-mofs-var-dialog
                            :mofs="item"
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
                        </edit-mofs-var-dialog>
                        <delete-dialog @onConfirm="deleteCenote(item.cenote)" />
                    </template>
                </v-data-table>
            </v-container>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="dialog = false">
                    Close
                </v-btn>
                <v-btn
                    color="blue darken-1"
                    text
                    data-cy="save"
                    :disabled="!this.valid"
                    @click="save()"
                >
                    Save
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script lang="ts">
import VariableWithValuesDTO from '@/models/VariableWithValuesDTO';
import { Component, Vue } from 'vue-property-decorator';
import EditMofsVarDialog from '@/components/admin/EditMofsVarDialog.vue';
import DeleteDialog from '@/components/admin/DeleteDialog.vue';

@Component({
    components: {
        EditMofsVarDialog,
        DeleteDialog,
    },
    props: {
        mofs: {},
    },
})
export default class EditMofsDialog extends Vue {
    editName = false;
    dialog = false;
    valid = false;

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

    remove(item: string): void {
        this.$props.mofs.enumValues.splice(
            this.$props.mofs.enumValues.indexOf(item),
            1,
        );
    }

    save(): void {
        this.$emit('onSave');
        this.dialog = false;
    }
}
</script>
