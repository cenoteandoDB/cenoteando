<template>
    <v-dialog v-model="dialog" max-width="600px">
        <template v-slot:activator="{ on, attrs }">
            <slot name="activator" v-bind:on="on" v-bind:attrs="attrs"> </slot>
        </template>

        <v-card class="pt-5 mt-5 justify-center">
            <v-card-title> Reference {{ reference._key }} </v-card-title>
            <v-card-text>
                <v-form v-model="valid">
                    <v-text-field
                        v-model="reference.reference"
                        data-cy="reference"
                        label="Reference"
                        required
                    ></v-text-field>
                    <v-text-field
                        v-model="reference.authors"
                        data-cy="authors"
                        label="Authors"
                    ></v-text-field>

                    <v-text-field
                        v-model="reference.shortName"
                        data-cy="short-name"
                        label="Short Name"
                    ></v-text-field>

                    <v-select
                        v-model="reference.type"
                        data-cy="Type"
                        :items="types"
                        label="Type"
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
import { Component, Vue } from 'vue-property-decorator';
import ReferenceDTO from '@/models/ReferenceDTO';

@Component({
    props: {
        reference: ReferenceDTO,
    },
})
export default class EditReferenceDialog extends Vue {
    dialog = false;
    valid = false;

    types = [
        'BOOK',
        'BOOK_CHAPTER',
        'JOURNAL',
        'OTHER',
        'REPORT',
        'THESIS',
        'WEBPAGE',
    ];

    save(): void {
        this.$emit('onSave');
        this.dialog = false;
    }
}
</script>
