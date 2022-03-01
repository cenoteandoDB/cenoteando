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
                     <v-select
                        v-model="newVariableData"
                        :items="themes"
                        multiple
                        chips
                        outlined
                        small-chips
                        menu-props="auto"
                        dense
                        label="Variable Whitelist"
                    ></v-select>
                    <v-select
                        v-if="user.role === 'CENOTERO_ADVANCED'"
                        v-model="newVariableData"
                        :items="themes"
                        multiple
                        chips
                        outlined
                        small-chips
                        menu-props="auto"
                        dense
                        label="Variable Blacklist"
                    ></v-select>
                    <v-select
                        v-model="newCenoteData"
                        :items="cenote.name"
                        dense
                        chips
                        outlined
                        small-chips
                        menu-props="auto"
                        label="Cenote Whitelist"
                        multiple
                    ></v-select>
                    <v-select
                        v-if="user.role === 'CENOTERO_ADVANCED'"
                        v-model="newCenoteData"
                        :items="cenote.name"
                        dense
                        chips
                        outlined
                        small-chips
                        menu-props="auto"
                        label="Cenote Blacklist"
                        multiple
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
    cenoteNames = ['cenote1', 'cenote2', 'cenote3'];
    variableThemes = ['variable1', 'variable2', 'variable3'];
    newCenoteData = [];
    newVariableData = [];
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
        'WATER'
    ];
    dialog = false;
    valid = false;
    roles = Object.values(UserRole);
    save(): void {
        this.$emit('onSave');
        this.dialog = false;
    }
}
</script>
