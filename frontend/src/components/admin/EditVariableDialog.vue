<template>
    <v-dialog v-model="dialog" max-width="600px">
        <template v-slot:activator="{ on, attrs }">
            <v-icon
                class="mr-2 action-button"
                v-on="on"
                v-bind="attrs"
                @click="editVariable(item)"
                color="green"
                data-cy="editVariable"
                >mdi-pencil</v-icon
            >
        </template>

        <v-card class="pt-5 mt-5 justify-center">
            <v-card-title>
                <span class="text-h5">Variables</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col>
                            <v-text-field
                                v-model="variable.name"
                                label="Name"
                                sm="6"
                                md="4"
                            ></v-text-field>
                        </v-col>

                        <v-col cols="12">
                            <v-textarea
                                v-model="variable.description"
                                label="Description"
                            ></v-textarea>
                        </v-col>
                        <v-col cols="12">
                            <v-select
                                v-model="variable.theme"
                                :items="themes"
                                label="Theme"
                                dense
                            ></v-select>
                        </v-col>

                        <v-col cols="12">
                            <v-select
                                v-model="variable.access_level"
                                :items="accessLevels"
                                label="Access Level"
                                dense
                            ></v-select>
                        </v-col>
                        <v-col cols="12">
                            <v-select
                                v-model="variable.type"
                                :items="dataTypes"
                                label="Data Type"
                                dense
                            ></v-select>
                        </v-col>

                        <v-col cols="12">
                            <v-checkbox
                                v-model="variable.timeseries"
                                label="Timeseries"
                            ></v-checkbox>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="dialog = false">
                    Close
                </v-btn>
                <v-btn color="blue darken-1" text @click="save()"> Save </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import VariableDTO from '@/models/VariableDTO';

@Component({
    props: {
        variable: VariableDTO,
    },
})
export default class EditVariableDialog extends Vue {
    dialog = false;
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
    dataTypes = ['NO_TYPE'];
    accessLevels = ['SENSITIVE', 'INSENSITIVE'];

    save(): void {
        this.$emit('onSave');
        this.dialog = false;
    }
}
</script>
