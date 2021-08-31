<template>
    <v-card class="table">
        <v-data-table
            :headers="headers"
            :items="item"
            :items-per-page="15"
            :search="search"
            class="elevation-1"
        >
            <template v-slot:top>
                <v-card-title>
                    <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        label="Search"
                        class="mx-2"
                    />
                </v-card-title>

                <v-expansion-panels>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            Filters
                        </v-expansion-panel-header>

                        <v-expansion-panel-content>
                            <v-card-text>Template</v-card-text>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </template>

            <template v-slot:[`item.action`]="{ item }">
                <edit-user-dialog :user="item" @onSave="updateSpecie(item)">
                    <template v-slot:activator="{ on, attrs }">
                        <v-icon
                            class="mr-2 action-button"
                            v-on="on"
                            v-bind="attrs"
                            color="green"
                            data-cy="editUser"
                            >mdi-pencil</v-icon
                        >
                    </template>
                </edit-user-dialog>

                <delete-dialog @onConfirm="deleteSpecie(item)" />
            </template>
        </v-data-table>
    </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import RemoteServices from '@/services/RemoteServices';

@Component({
    components: {},
})
export default class Cenotes extends Vue {
    headers = [
        { text: 'Cenoteando ID', value: '_key' },
        { text: 'Name', value: 'name' },
        { text: 'Naturalista ID', value: 'iNaturalistId' },
        { text: 'Alphia ID', value: 'aphiaId' },
        { text: 'Gbif ID', value: 'gbifId' },
    ];

    item = [];

    search = '';
    newSpecie = '';
}
</script>
