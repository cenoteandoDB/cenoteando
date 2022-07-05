<template>
    <v-dialog v-model="dialog" max-width="600px">
        <template v-slot:activator="{ on, attrs }">
            <slot name="activator" v-bind:on="on" v-bind:attrs="attrs"> </slot>
        </template>

        <v-card class="pt-5 mt-5 justify-center">
            <v-card-text>
                <v-form v-model="valid">
                    <v-text-field
                        v-if="
                            mofs.type == 'TIME' ||
                            mofs.type == 'UNITLESS_NUMBER' ||
                            mofs.type == 'JSON' ||
                            mofs.type == 'NUMBER_WITH_UNITS' ||
                            mofs.type == 'DATETIME' ||
                            mofs.type == 'DATE' ||
                            mofs.type == 'TEXT'
                        "
                        v-model="mofs.value"
                        data-cy="value"
                        label="Value"
                        required
                    ></v-text-field>

                    <v-combobox
                        v-if="mofs.type == 'ENUM'"
                        label="Enum Values"
                        data-cy="enum-values"
                        v-model="mofValueEnum"
                        append-icon=""
                        chips
                        deletable-chips
                        clearable
                        multiple
                        solo
                        :rules="[
                            (v) =>
                                (!!v && !!v.length) ||
                                'Enum Values are required for type ENUM',
                        ]"
                        required
                    >
                        <v-text-field
                            v-if="mofs.type === '' || mofs.type === undefined"
                            v-model="mofValue"
                            data-cy="Value"
                            label="Value"
                            required
                        ></v-text-field>
                    </v-combobox>

                    <v-checkbox
                        v-if="mofs.type === 'BOOLEAN'"
                        v-model="mofValueBool"
                        label="Value"
                    ></v-checkbox>

                    <v-text-field
                        v-if="mofs.timeseries === true"
                        v-model="mofDateNow"
                        value="Timestamp"
                    >
                    </v-text-field>

                    <v-text-field
                        v-if="mofs.timeseries === false"
                        v-model="mofDate"
                        value="Timestamp"
                    >
                    </v-text-field>
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
                    Add
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script lang="ts">
import VariableWithValuesDTO from '@/models/VariableWithValuesDTO';
import { Component, Vue } from 'vue-property-decorator';

@Component({
    props: {
        mofs: {},
    },
})
export default class EditMofsVarDialog extends Vue {
    editName = false;
    dialog = false;
    valid = false;
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
    mofValue = "";
    mofValueBool = false;
    mofValueEnum = [];
    mofDate = "";
    mofDateNowConversion = new Date();
    mofDateNow = this.mofDateNowConversion.toISOString();

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
