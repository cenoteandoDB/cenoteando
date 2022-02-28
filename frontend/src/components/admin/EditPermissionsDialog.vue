<template>
    <v-dialog v-model="dialog" max-width="600px">
        <template v-slot:activator="{ on, attrs }">
            <slot name="activator" v-bind:on="on" v-bind:attrs="attrs"> </slot>
        </template>

        <v-card class="pt-5 mt-5 justify-center">
            <v-card-title>
                <span class="text-h5">Permissions</span>
            </v-card-title>
            <v-card-text>
                <v-form v-model="valid">
                    <v-autocomplete
                        v-model="cenoteNames"
                        :items="items"
                        dense
                        chips
                        outlined
                        small-chips
                        label="Cenotes"
                        multiple
                    ></v-autocomplete>
                    <v-autocomplete
                        v-model="variableNames"
                        :items="items"
                        dense
                        chips
                        outlined
                        small-chips
                        label="Variables"
                        multiple
                    ></v-autocomplete>
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
import UserDTO, { UserRole } from '@/models/UserDTO';
import { Component, Vue } from 'vue-property-decorator';
import CenoteDTO from '@/models/CenoteDTO';
import VariableDTO from '@/models/VariableDTO';

@Component({
    props: {
        user: UserDTO,
        cenote: CenoteDTO,
        variable: VariableDTO,
    },
})
export default class EditPermissionsDialog extends Vue {
    cenoteNames = Object.values(CenoteDTO.name);
    variableNames = Object.values(VariableDTO.name);
    dialog = false;
    valid = false;
    save(): void {
        this.$emit('onSave');
        this.dialog = false;
    }
}
</script>
