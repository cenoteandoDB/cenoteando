<template>
    <v-dialog v-model="dialog" max-width="600px">
        <template v-slot:activator="{ on, attrs }">
            <slot name="activator" v-bind:on="on" v-bind:attrs="attrs"> </slot>
        </template>

        <v-card class="pt-5 mt-5 justify-center">
            <v-card-title>
                <span v-if="editName === false" class="text-h6">{{
                    cenote.name
                }}</span>
                <span
                    v-if="
                        (!cenote.name || cenote.name === '') &&
                        editName === false
                    "
                    class="text-h6"
                    >Name</span
                >
                <v-icon
                    v-if="editName === false"
                    @click="
                        () => {
                            editName = true;
                        }
                    "
                    class="pl-2 pt-2"
                    medium
                    color="green"
                    >mdi-pencil
                </v-icon>
                <v-form v-model="valid" v-if="editName === true">
                    <v-container class="d-flex">
                        <v-text-field
                            v-model="cenote.name"
                            label="Name"
                            :rules="[(v) => !!v || 'Name is required']"
                            required
                        ></v-text-field>
                        <v-icon
                            v-if="editName === true"
                            @click="editName = false"
                            color="primary"
                            >mdi-pencil
                        </v-icon>
                    </v-container>
                </v-form>
            </v-card-title>
            <v-card-text>
                <v-form v-model="valid">
                    <v-combobox
                        label="Alternative Names"
                        data-cy="alt-names"
                        v-model="cenote.alternativeNames"
                        append-icon=""
                        chips
                        clearable
                        multiple
                    >
                        <template
                            v-slot:selection="{ attrs, item, select, selected }"
                        >
                            <v-chip
                                small
                                v-bind="attrs"
                                :input-value="selected"
                                close
                                @click="select"
                                @click:close="remove(item)"
                            >
                                {{ item }}
                            </v-chip>
                        </template>
                    </v-combobox>

                    <v-select
                        v-model="cenote.type"
                        :items="types"
                        data-cy="cenote-type"
                        label="Cenote Type"
                        :rules="[(v) => !!v || 'Cenote Type is required']"
                        required
                    ></v-select>

                    <v-checkbox
                        v-model="cenote.touristic"
                        data-cy="touristic"
                        label="Touristic"
                        :rules="[(v) => !!v || 'This field is required']"
                        required
                    ></v-checkbox>

                    <v-container class="d-flex d-row justify-end">
                        <v-text-field
                            v-model="latitudeText"
                            data-cy="latitude"
                            label="Latitude"
                            :rules="[
                                (v) => !!v || 'Cenote Latitude is required',
                            ]"
                            required
                        ></v-text-field>
                        <v-select
                            v-model="latitudeDirSelection"
                            class="pt-2 pl-10 pr-10"
                            :items="latitudeDir"
                            dense
                            solo
                            width="5"
                            style="width: 5px"
                            required
                        ></v-select>
                    </v-container>

                    <v-container class="d-flex d-row justify-center">
                        <v-text-field
                            v-model="longitudeText"
                            data-cy="longitude"
                            label="Longitude"
                            :rules="[
                                (v) => !!v || 'Cenote Longitude is required',
                            ]"
                            required
                        ></v-text-field>
                        <v-select
                            v-model="longitudeDirSelection"
                            class="pt-2 pl-10 pr-10"
                            :items="longitudeDir"
                            dense
                            solo
                            width="5"
                            style="width: 5px"
                            required
                        ></v-select>
                    </v-container>

                    <v-select
                        v-model="cenote.issues"
                        data-cy="cenote-issues"
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
                    data-cy="Save"
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
        cenoteProp: CenoteDTO,
    },
})
export default class EditCenoteDialog extends Vue {
    dialog = false;
    valid = false;
    editName = false;

    types = Object.values(CenoteType);
    touristic = [true, false];
    latitudeText = '';
    longitudeText = '';
    latitudeDirSelection = 'N';
    longitudeDirSelection = 'W';

    issues = Object.values(CenoteIssue);
    cenote = new CenoteDTO();
    latitudeDir = ['N', 'S'];
    longitudeDir = ['W', 'E'];

    remove(item: string): void {
        this.$props.cenoteProp.alternativeNames.splice(
            this.$props.cenoteProp.alternativeNames.indexOf(item),
            1,
        );
        this.$props.cenoteProp.alternativeNames = [
            ...this.$props.cenoteProp.alternativeNames,
        ];
    }

    created(): void {
        this.cenote = new CenoteDTO(this.$props.cenoteProp);
        let lat = this.cenote.getLatitude();
        let lon = this.cenote.getLongitude();

        if (lat) {
            this.latitudeText = Math.abs(lat).toString();
            if (lat >= 0) this.latitudeDirSelection = 'N';
            else this.latitudeDirSelection = 'S';
        } else this.latitudeText = '';

        if (lon) {
            this.longitudeText = Math.abs(lon).toString();
            if (lon >= 0) this.longitudeDirSelection = 'E';
            else this.longitudeDirSelection = 'W';
        } else this.longitudeText = '';
    }

    save(): void {
        let lat = JSON.parse(this.latitudeText);
        let lon = JSON.parse(this.longitudeText);
        if (this.latitudeDirSelection === 'S') lat = -lat;
        if (this.longitudeDirSelection === 'W') lat = -lon;
        this.cenote.setCoordinates(lat, lon);

        Object.assign(this.$props.cenoteProp, this.cenote);
        this.$emit('onSave');
        this.dialog = false;
    }
}
</script>
