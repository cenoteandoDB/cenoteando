<template>
    <v-dialog v-model="dialog" max-width="600px">
        <template v-slot:activator="{ on, attrs }">
            <slot name="activator" v-bind:on="on" v-bind:attrs="attrs"> </slot>
        </template>

        <v-card class="pt-5 mt-5 justify-center">
            <v-card-title>
                <!-- TODO: Change title to the name of the cenote with a pencil icon for editing -->
                <span class="text-h5">Cenotes</span>
            </v-card-title>
            <v-card-text>
                <v-form v-model="valid">
                    <v-text-field
                        v-model="cenote.name"
                        label="Name"
                        :rules="[(v) => !!v || 'Name is required']"
                        required
                    ></v-text-field>

                    <v-select
                        v-model="cenote.type"
                        :items="types"
                        label="Cenote Type"
                        :rules="[(v) => !!v || 'Cenote Type is required']"
                        required
                    ></v-select>

                    <v-checkbox
                        v-model="cenote.touristic"
                        label="Touristic"
                    ></v-checkbox>

                    <v-select
                        v-model="cenote.issues"
                        :items="issues"
                        label="Cenote Issues"
                        multiple
                        chips
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
import CenoteDTO, { CenoteIssue, CenoteType } from '@/models/CenoteDTO';

@Component({
    props: {
        cenote: CenoteDTO,
    },
})
export default class EditCenoteDialog extends Vue {
    dialog = false;
    valid = false;

    types = Object.values(CenoteType);
    touristic = [true, false];
    issues = Object.values(CenoteIssue);

    save(): void {
        this.$emit('onSave');
        this.dialog = false;
    }
}
</script>
