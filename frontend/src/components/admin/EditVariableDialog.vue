<template>
    <v-dialog v-model="dialog" max-width="600px">
        <template v-slot:activator="{ on, attrs }">
            <slot name="activator" v-bind:on="on" v-bind:attrs="attrs"> </slot>
        </template>

        <v-card class="pt-5 mt-5 justify-center">
            <v-card-title>
                <span class="text-h6" v-if="editName === false">{{
                    variable.name
                }}</span>
                <span
                    v-if="
                        (!variable.name || variable.name === '') &&
                        editName === false
                    "
                    class="text-h6"
                    >Name</span
                >
                <v-icon
                    v-if="editName === false"
                    @click="
                        () => {
                            editName = true;
                        }
                    "
                    class="pl-1 pt-2"
                    medium
                    color="green"
                    >mdi-pencil
                </v-icon>
                <v-form v-model="valid" v-if="editName === true">
                    <v-container class="d-flex">
                        <v-text-field
                            v-model="variable.name"
                            data-cy="variable-name"
                            label="Name"
                            :rules="[(v) => !!v || 'Name is required']"
                            required
                        ></v-text-field>
                        <v-icon
                            v-if="editName === true"
                            @click="editName = false"
                            color="primary"
                            >mdi-pencil
                        </v-icon>
                    </v-container>
                </v-form>
            </v-card-title>
            <v-card-text>
                <v-form v-model="valid">
                    <v-textarea
                        v-model="variable.description"
                        data-cy="description"
                        label="Description"
                        :rules="[(v) => !!v || 'Description is required']"
                        required
                    ></v-textarea>

                    <v-select
                        v-model="variable.theme"
                        data-cy="theme"
                        :items="themes"
                        label="Theme"
                        :rules="[(v) => !!v || 'Theme is required']"
                        required
                    ></v-select>

                    <v-select
                        v-model="variable.accessLevel"
                        data-cy="access-level"
                        :items="accessLevels"
                        label="Access Level"
                        :rules="[(v) => !!v || 'Access Level is required']"
                        required
                    ></v-select>

                    <v-select
                        v-model="variable.type"
                        data-cy="data-type"
                        :items="dataTypes"
                        label="Data Type"
                        :rules="[(v) => !!v || 'Data Type is required']"
                        required
                    ></v-select>

                    <v-checkbox
                        v-model="variable.timeseries"
                        data-cy="timeseries"
                        label="Timeseries"
                    ></v-checkbox>

                    <v-checkbox
                        v-model="variable.multiple"
                        data-cy="multiple"
                        label="multiple"
                    ></v-checkbox>

                    <v-combobox
                        v-if="variable.type === 'ENUM'"
                        label="Enum Values"
                        data-cy="enum-values"
                        v-model="variable.enumValues"
                        append-icon=""
                        chips
                        deletable-chips
                        clearable
                        multiple
                        solo
                    >
                        <template
                            v-slot:selection="{ attrs, item, select, selected }"
                        >
                            <v-chip
                                small
                                v-bind="attrs"
                                :input-value="selected"
                                close
                                @click="select"
                                @click:close="remove(item)"
                            >
                                {{ item }}
                            </v-chip>
                        </template>
                    </v-combobox>

                    <v-text-field
                        v-if="variable.type === 'NUMBER_WITH_UNITS'"
                        v-model="variable.units"
                        data-cy="units"
                        label="Units"
                    ></v-text-field>

                    <v-text-field
                        v-model="variable.methodology"
                        data-cy="methodology"
                        label="Methodology"
                    ></v-text-field>
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
import { Component, Vue } from 'vue-property-decorator';
import VariableDTO from '@/models/VariableDTO';

@Component({
    props: {
        variable: VariableDTO,
    },
})
export default class EditVariableDialog extends Vue {
    editName = false;
    dialog = false;
    valid = false;

    items = [''];
    chips = [''];

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
    dataTypes = ['NO_TYPE', 'NUMBER_WITH_UNITS', 'BOOLEAN', 'ENUM'];
    accessLevels = ['PUBLIC', 'PRIVATE', 'SENSITIVE'];

    remove(item: string): void {
        this.chips.splice(this.chips.indexOf(item), 1);
        this.chips = [...this.chips];
    }

    save(): void {
        this.$emit('onSave');
        this.dialog = false;
    }
}
</script>
