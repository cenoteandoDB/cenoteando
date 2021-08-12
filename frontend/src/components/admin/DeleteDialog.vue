<template>
    <v-dialog v-model="dialog" persistent max-width="600px">
        <template v-slot:activator="{ on, attrs }">
            <v-icon
                class="mr-2 action-button"
                v-bind="attrs"
                v-on="on"
                color="red"
                data-cy="deleteVariable"
                >mdi-delete-forever</v-icon
            >
        </template>

        <v-card>
            <v-card-title>
                <span class="text-h5">Delete</span>
            </v-card-title>
            <v-card-text>
                <v-container class="pt-10 pl-10">
                    <h2>Are you sure you want to delete?</h2>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="dialog = false">
                    Cancel
                </v-btn>
                <v-btn color="blue darken-1" text @click="confirm()">
                    Confirm
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class EditVariableDialog extends Vue {
    dialog = false;

    confirm(): void {
        this.$emit('onConfirm');
        this.dialog = false;
    }
}
</script>
