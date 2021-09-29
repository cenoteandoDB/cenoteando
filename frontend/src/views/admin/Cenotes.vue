<template>
    <v-card class="table mx-16">
        <v-data-table
            :headers="headers"
            :items="filteredCenotes"
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
                    <v-spacer />
                    <edit-cenote-dialog
                        :cenoteProp="newCenote"
                        @onSave="createCenote()"
                    >
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                v-on="on"
                                v-bind="attrs"
                                data-cy="createButton"
                                class="ma-2"
                            >
                                <v-icon color="green">mdi-plus</v-icon>
                            </v-btn>
                        </template>
                    </edit-cenote-dialog>
                    <v-dialog max-width="600px">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                v-on="on"
                                v-bind="attrs"
                                data-cy="uploadButton"
                                class="ma-2"
                                ><v-icon color="primary"
                                    >mdi-upload</v-icon
                                ></v-btn
                            >
                        </template>
                        <v-card class="pt-5 mt-5 justify-center">
                            <v-card-title>
                                <span class="text-h5">Upload cenotes</span>
                            </v-card-title>
                            <v-card-text>
                                <v-form>
                                    <v-file-input
                                        @change="selectFiles"
                                        multiple
                                        counter
                                        show-size
                                        chips
                                        accept=".csv"
                                    />
                                </v-form>
                                <!-- TODO: Add progressbar
                                    <v-progress-linear
                                        :value="this.uploadProgress"
                                    ></v-progress-linear>
                                    -->
                                <v-btn @click="upload">Upload</v-btn>
                            </v-card-text>
                        </v-card>
                    </v-dialog>

                    <v-btn
                        @click="download"
                        data-cy="downloadButton"
                        class="ma-2"
                        ><v-icon color="primary">mdi-download</v-icon></v-btn
                    >
                </v-card-title>

                <v-expansion-panels class="pa-5">
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            Filters
                        </v-expansion-panel-header>

                        <v-expansion-panel-content>
                            <v-select
                                v-model="filterTypes"
                                :items="types"
                                label="Theme"
                                multiple
                                chips
                                hint="Cenote type"
                                persistent-hint
                            ></v-select>
                            <v-select
                                v-model="filterTouristic"
                                :items="touristic"
                                label="Touristic"
                                multiple
                                chips
                                hint="Cenote touristic"
                                persistent-hint
                            ></v-select>
                            <v-select
                                v-model="filterIssues"
                                :items="issues"
                                label="Issues"
                                multiple
                                chips
                                hint="Cenote issues"
                                persistent-hint
                            ></v-select>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </template>

            <template v-slot:[`item.action`]="{ item }">
                <edit-cenote-dialog
                    :cenoteProp="item.cenote"
                    @onSave="updateCenote(item.cenote)"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-icon
                            class="mr-2 action-button"
                            v-on="on"
                            v-bind="attrs"
                            :data-cy="'editCenote' + item._key"
                            color="green"
                            >mdi-pencil</v-icon
                        >
                    </template>
                </edit-cenote-dialog>

                <delete-dialog @onConfirm="deleteCenote(item.cenote)" />
            </template>
        </v-data-table>
    </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CenoteDTO, { CenoteIssue, CenoteType } from '@/models/CenoteDTO';
import RemoteServices from '@/services/RemoteServices';
import EditCenoteDialog from '@/components/admin/EditCenoteDialog.vue';
import DeleteDialog from '@/components/admin/DeleteDialog.vue';
import FileService from '@/services/FileService';
import { Feature, Point } from 'geojson';

interface CenoteData {
    _key: string;
    name: string;
    state: string;
    municipality: string;
    alternativeNames: string;
    type: string;
    touristic: boolean;
    coordinates: string;
    issues: string;
    cenote: CenoteDTO;
}

@Component({
    components: {
        EditCenoteDialog,
        DeleteDialog,
    },
})
export default class Cenotes extends Vue {
    files: File[] = [];
    uploadProgress = 0;

    headers = [
        { text: 'Cenote ID', value: '_key' },
        { text: 'Name', value: 'name' },
        { text: 'State', value: 'state' },
        { text: 'Municipality', value: 'municipality' },
        { text: 'Alternative names', value: 'alternativeNames' },
        { text: 'Type', value: 'type' },
        { text: 'Touristic', value: 'touristic' },
        { text: 'Coordinates', value: 'coordinates' },
        { text: 'Issues', value: 'issues' },
        { text: 'Actions', value: 'action' },
    ];

    types = Object.values(CenoteType);
    touristic = [true, false];
    issues = Object.values(CenoteIssue);

    // TODO: Get List of municipalities from cenotes or RemoteServices?
    municipalities = [];

    search = '';
    newCenote = new CenoteDTO();
    filterTypes: string[] = [];
    filterTouristic: boolean[] = [];
    filterIssues: CenoteIssue[] = [];

    cenotes: CenoteDTO[] = [];

    convertCoordinates(latitude: number, longitude: number): string {
        const absLon = Math.abs(longitude);
        let lonDeg = Math.floor(absLon);
        let lonMin = Math.floor((absLon - lonDeg) * 60);
        let lonSec = Math.floor(((absLon - lonDeg) * 60 - lonMin) * 60);
        const lonDir = longitude >= 0 ? 'E' : 'W';

        if (lonSec == 60) {
            lonMin++;
            lonSec = 0;
        }

        if (lonMin == 60) {
            lonDeg++;
            lonMin = 0;
        }

        const absLat = Math.abs(latitude);
        let latDeg = Math.floor(absLat);
        let latMin = Math.floor((absLat - latDeg) * 60);
        let latSec = Math.floor(((absLat - latDeg) * 60 - latMin) * 60);
        const latDir = latitude >= 0 ? 'N' : 'S';

        if (latSec == 60) {
            latMin++;
            latSec = 0;
        }

        if (latMin == 60) {
            latDeg++;
            latMin = 0;
        }

        return `${latDeg}° ${latMin}' ${latSec}'' ${latDir}, ${lonDeg}° ${lonMin}' ${lonSec}'' ${lonDir}`;
    }

    get filteredCenotes(): CenoteData[] {
        return this.cenotes
            .filter(
                (c) =>
                    !this.filterTypes.length ||
                    this.filterTypes.includes(c.type),
            )
            .filter(
                (c) =>
                    !this.filterTouristic.length ||
                    this.filterTouristic.includes(c.touristic),
            )
            .filter(
                (c) =>
                    !this.filterIssues.length ||
                    this.filterIssues.filter((f) => c.issues.includes(f))
                        .length,
            )
            .map((c) => {
                const geojsonCoords = ((c.geojson as Feature).geometry as Point)
                    .coordinates;
                const coordinates = this.convertCoordinates(
                    geojsonCoords[1],
                    geojsonCoords[0],
                );

                return {
                    _key: c._key.toString(),
                    name: c.name,
                    // TODO: Get state and municipality from gadm
                    state: c.gadm.toString(),
                    municipality: c.gadm.toString(),
                    alternativeNames: c.alternativeNames.join(', '),
                    type: c.type.toString(),
                    touristic: c.touristic,
                    coordinates,
                    issues: c.issues.join(', '),
                    cenote: c,
                };
            });
    }

    async created(): Promise<void> {
        await this.$store.dispatch('loading');

        (async () => {
            let generator = RemoteServices.cenotesGenerator(30);
            for await (let batch of generator) {
                if (!this.cenotes.length)
                    await this.$store.dispatch('clearLoading');

                this.cenotes.push(...batch);
            }
        })().catch(async (error) => {
            await this.$store.dispatch('error', error);
        });
    }

    async createCenote(): Promise<void> {
        await this.$store.dispatch('loading');

        try {
            await RemoteServices.updateCenote(this.newCenote);
        } catch (error) {
            await this.$store.dispatch('error', error);
        }

        await this.$store.dispatch('clearLoading');
        this.cenotes.unshift(this.newCenote);
        this.newCenote = new CenoteDTO();
    }

    async updateCenote(cenote: CenoteDTO): Promise<void> {
        await this.$store.dispatch('loading');

        try {
            await RemoteServices.updateCenote(cenote);
        } catch (error) {
            // TODO: revert to original value in case of failure
            await this.$store.dispatch('error', error);
        }

        await this.$store.dispatch('clearLoading');
    }

    async deleteCenote(cenote: CenoteDTO): Promise<void> {
        await RemoteServices.deleteCenote(cenote._key);
        this.cenotes = this.cenotes.filter((v) => v._key != cenote._key);
    }

    async download(): Promise<void> {
        await this.$store.dispatch('loading');

        try {
            const csv = await RemoteServices.cenotesToCsv();
            FileService.download(csv, 'cenotes.csv', 'text/csv');
        } catch (error) {
            await this.$store.dispatch('error', error);
        }

        await this.$store.dispatch('clearLoading');
    }

    selectFiles(files: File[]): void {
        this.uploadProgress = 0;
        this.files = files;
    }

    async upload(): Promise<void> {
        await this.$store.dispatch('loading');

        try {
            await RemoteServices.csvToCenotes(this.files, (event) => {
                this.uploadProgress = Math.round(
                    (100 * event.loaded) / event.total,
                );
            });
        } catch (error) {
            this.uploadProgress = 0;
            await this.$store.dispatch('error', error);
        }

        await this.$store.dispatch('clearLoading');
    }
}
</script>
