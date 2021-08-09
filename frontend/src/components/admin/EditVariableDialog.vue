<template>
    <v-dialog v-model="dialog" persistent max-width="600px">
        <template v-slot:activator="{ on, attrs }">
            <v-icon
                class="mr-2 action-button"
                v-on="on"
                v-bind="attrs"
                @click="editVariable(item)"
                color="green"
                data-cy="editVariable"
                >mdi-pencil</v-icon
            >
        </template>

        <span>Edit</span>

        <v-card>
            <v-card-title>
                <span class="text-h5">Variables</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col>
                            <v-text-field
                                label="Name"
                                sm="6"
                                md="4"
                            ></v-text-field>
                        </v-col>

                        <v-col cols="12">
                            <v-text-field label="Description"></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field label="Theme"></v-text-field>
                        </v-col>

                        <v-col cols="12">
                            <v-text-field label="Access Level"></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field label="Data Type"></v-text-field>
                        </v-col>

                        <v-col cols="12">
                            <v-text-field label="Timeseries"></v-text-field>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="dialog = false">
                    Close
                </v-btn>
                <v-btn color="blue darken-1" text @click="dialog = false">
                    Save
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import { Component, Vue } from 'vue-property-decorator';
@Component
export default class EditVariableDialog extends Vue {
    dialog = false;
}
</script>
