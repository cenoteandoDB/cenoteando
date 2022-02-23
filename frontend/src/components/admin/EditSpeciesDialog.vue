<template>
    <v-dialog v-model="dialog" max-width="600px">
        <template v-slot:activator="{ on, attrs }">
            <slot name="activator" v-bind:on="on" v-bind:attrs="attrs"> </slot>
        </template>

        <v-card class="pt-5 mt-5 justify-center">
            <v-card-title>
                <span>Species</span>
            </v-card-title>

            <v-card-text>
                <v-form v-model="valid">
                    <v-container class="d-flex">
                        <v-text-field
                            v-model="species.aphiaId"
                            label="Aphia Id"
                        ></v-text-field>
                    </v-container>
                </v-form>
                <v-form v-model="valid">
                    <v-container class="d-flex">
                        <v-text-field
                            v-model="species.iNaturalistId"
                            label="Naturalist ID"
                        ></v-text-field>
                    </v-container>
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
                    data-cy="save"
                    @click="save()"
                >
                    Save
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script lang="ts">
import SpeciesDTO from '@/models/SpeciesDTO';
import { Component, Vue } from 'vue-property-decorator';

@Component({
    props: {
        species: SpeciesDTO,
    },
})
export default class EditSpeciesDialog extends Vue {
    dialog = false;
    valid = false;

    save(): void {
        this.$emit('onSave');
        this.dialog = false;
    }
}
</script>
