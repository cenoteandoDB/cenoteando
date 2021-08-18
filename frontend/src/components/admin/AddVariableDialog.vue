<template>
    <v-dialog v-model="dialog" max-width="500px">
        <template v-slot:activator="{ on, attrs }">
            <v-btn
                v-bind="attrs"
                v-on="on"
                @click="newVariable"
                data-cy="createButton"
                ><v-icon color="green">mdi-plus</v-icon></v-btn
            >
        </template>
        <v-card>
            <v-card-title>
                <span class="text-h5">Create</span>
            </v-card-title>
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
export default class AddVariableDialog extends Vue {
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
