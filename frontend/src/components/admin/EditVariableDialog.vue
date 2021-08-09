<template>
    <v-dialog
        :value="dialog"
        @input="$emit('close-dialog')"
        @keydown.esc="$emit('close-dialog')"
        max-width="75%"
        max-height="80%"
    >
        <v-card>
            <v-card-title>
                <span class="headline"> New Variable </span>
            </v-card-title>

            <v-card-text class="text-left" v-if="editVariable">
                <p><b>Variable Name:</b> {{ editVariable.name }}</p>
                <p v-if="isCreateVariable">
                    <b>Name:</b> {{ editVariable.name }}
                </p>
                <v-text-field
                    v-if="!isCreateVariable"
                    v-model="editVariable.name"
                    label="Name"
                    data-cy="VariableNameInput"
                />
                <v-text-field
                    v-model="editVariable.access_level"
                    label="Access Level"
                    data-cy="accessLevelInput"
                />
                <v-text-field
                    v-model="editVariable.description"
                    label="Description"
                    data-cy="DescriptionInput"
                />

                <v-text-field
                    v-model="editVariable.theme"
                    label="Theme"
                    data-cy="ThemeInput"
                />

                <v-text-field
                    v-model="editVariable.access_level"
                    label="Access Level"
                    data-cy="AccessInput"
                />
                <v-text-field
                    v-model="editVariable.timeseries"
                    label="Timeseries"
                    data-cy="TimeseriesInput"
                />
                <v-text-field
                    v-model="editVariable.type"
                    label="Data Type"
                    data-cy="DataTypeInput"
                />
            </v-card-text>

            <v-card-actions>
                <v-spacer />
                <v-btn
                    color="red darken-1"
                    @click="$emit('close-dialog')"
                    data-cy="cancelButton"
                    >Cancel</v-btn
                >
                <v-btn
                    color="green darken-1"
                    @click="saveVariable()"
                    data-cy="saveButton"
                    >Save</v-btn
                >
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Model, Prop, Vue } from 'vue-property-decorator';
import RemoteServices from '@/services/RemoteServices';
import VariableDTO from '@/models/VariableDTO';
@Component
export default class EditVariableDialog extends Vue {
    @Model('dialog', Boolean) dialog!: boolean;
    @Prop({ type: VariableDTO, required: true })
    readonly variable!: VariableDTO;

    variables: VariableDTO[] = [];

    editVariable!: VariableDTO;
    isCreateVariable = false;
}
</script>
