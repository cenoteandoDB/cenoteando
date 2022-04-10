<template>
    <v-dialog v-model="dialog" max-width="600px">
        <template v-slot:activator="{ on, attrs }">
            <slot name="activator" v-bind:on="on" v-bind:attrs="attrs"> </slot>
        </template>

        <v-card class="pt-5 mt-5 justify-center">
            <v-card-title>
                <span class="text-h6">{{
                    mofs.name
                }}</span>
                
            </v-card-title>
            <v-card-text>
                <v-form v-model="valid">
                    <v-textarea
                        v-model="mofs.description"
                        data-cy="description"
                        label="Description"
                        :rules="[(v) => !!v || 'Description is required']"
                        required
                    ></v-textarea>

                    <v-select
                        v-model="mofs.theme"
                        data-cy="theme"
                        :items="themes"
                        label="Theme"
                        :rules="[(v) => !!v || 'Theme is required']"
                        required
                    ></v-select>

                    <v-select
                        v-model="mofs.accessLevel"
                        data-cy="access-level"
                        :items="accessLevels"
                        label="Access Level"
                        :rules="[(v) => !!v || 'Access Level is required']"
                        required
                    ></v-select>


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
import VariableWithValuesDTO from '@/models/VariableWithValuesDTO';
import { Component, Vue } from 'vue-property-decorator';

@Component({
    props: {
        mofs: VariableWithValuesDTO,
    },
})
export default class EditMofsDialog extends Vue {
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
