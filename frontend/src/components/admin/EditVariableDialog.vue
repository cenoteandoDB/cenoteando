<template>
    <v-dialog v-model="dialog" max-width="600px">
        <template v-slot:activator="{ on, attrs }">
            <slot name="activator" v-bind:on="on" v-bind:attrs="attrs"> </slot>
        </template>

        <v-card class="pt-5 mt-5 justify-center">
            <v-card-title>
                <!-- TODO: Change title to the name of the variable with a pencil icon for editing -->
                <span class="text-h6">{{ variable.name }}</span>
                <v-icon class="pt-2 pl-1" @click="true" small color="green"
                    >mdi-square-edit-outline
                </v-icon>
            </v-card-title>
            <v-card-text>
                <v-form v-model="valid">
                    <v-text-field
                        v-model="variable.name"
                        label="Name"
                        :rules="[(v) => !!v || 'Name is required']"
                        required
                    ></v-text-field>

                    <v-textarea
                        v-model="variable.description"
                        label="Description"
                        :rules="[(v) => !!v || 'Description is required']"
                        required
                    ></v-textarea>

                    <v-select
                        v-model="variable.theme"
                        :items="themes"
                        label="Theme"
                        :rules="[(v) => !!v || 'Theme is required']"
                        required
                    ></v-select>

                    <v-select
                        v-model="variable.access_level"
                        :items="accessLevels"
                        label="Access Level"
                        :rules="[(v) => !!v || 'Access Level is required']"
                        required
                    ></v-select>

                    <v-select
                        v-model="variable.type"
                        :items="dataTypes"
                        label="Data Type"
                        :rules="[(v) => !!v || 'Data Type is required']"
                        required
                    ></v-select>

                    <v-checkbox
                        v-model="variable.timeseries"
                        label="Timeseries"
                    ></v-checkbox>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="dialog = false">
                    Close
                </v-btn>
                <v-btn
                    color="blue darken-1"
                    text
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
import { Component, Vue } from 'vue-property-decorator';
import VariableDTO from '@/models/VariableDTO';

@Component({
    props: {
        variable: VariableDTO,
    },
})
export default class EditVariableDialog extends Vue {
    dialog = false;
    valid = false;

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
    accessLevels = ['PUBLIC', 'PRIVATE', 'SENSITIVE'];

    save(): void {
        this.$emit('onSave');
        this.dialog = false;
    }
}
</script>
