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
                        :cenote="newCenote"
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
                <edit-cenote-dialog :cenote="item" @onSave="updateCenote(item)">
                    <template v-slot:activator="{ on, attrs }">
                        <v-icon
                            class="mr-2 action-button"
                            v-on="on"
                            v-bind="attrs"
                            color="green"
                            data-cy="editCenote"
                            >mdi-pencil</v-icon
                        >
                    </template>
                </edit-cenote-dialog>

                <delete-dialog @onConfirm="deleteCenote(item)" />
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
        { text: 'Name', value: 'name' },
        // TODO: fetch gadm from database
        { text: 'State', value: 'gadm' },
        { text: 'Municipality', value: 'gadm' },
        { text: 'Alternative names', value: 'alternative_names' },
        { text: 'Type', value: 'type' },
        { text: 'Touristic', value: 'touristic' },
        // TODO: Convert to degrees minutes and seconsds
        { text: 'Coordinates', value: 'geojson.geometry.coordinates' },
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

    convertCoordinates(lon: number, lat: number): string {
        var longitude = Math.floor(lon);
        var minfloat_lon = (lon - longitude) * 60;
        var m_lon = Math.floor(minfloat_lon);
        var secfloat_lon = (minfloat_lon - m_lon) * 60;
        var s_lon = Math.round(secfloat_lon);
        var latitude = Math.floor(lat);
        var minfloat_lat = (lat - latitude) * 60;
        var m_lat = Math.floor(minfloat_lat);
        var secfloat_lat = (minfloat_lat - m_lat) * 60;
        var s_lat = Math.round(secfloat_lat);
        var direction = '';

        if (s_lon == 60) {
            m_lon++;
            s_lon = 0;
        }
        if (m_lon == 60) {
            longitude++;
            m_lon = 0;
        }
        if (s_lat == 60) {
            m_lat++;
            s_lat = 0;
        }
        if (m_lat == 60) {
            latitude++;
            m_lat = 0;
        }

        if (longitude < 0 && longitude >= -180) {
            direction = 'W';
        }
        if (longitude > 0 && longitude <= 180) {
            direction = 'E';
        }
        if (latitude < 0 && latitude >= -90) {
            direction = 'S';
        }
        if (latitude > 0 && latitude <= 90) {
            direction = 'N';
        }

        return (
            '' +
            longitude +
            '° ' +
            m_lon +
            "' " +
            s_lon +
            "'' " +
            +direction +
            '' +
            latitude +
            '° ' +
            m_lat +
            "' " +
            s_lat +
            "'' " +
            direction
        );
    }

    get filteredCenotes(): CenoteDTO[] {
        // console.log(
        //     this.cenotes.map((c) => {
        //         return c.geojson.geometry.coordinates.map((v) => {
        //             var d = Math.floor(v);
        //             var minfloat = (v - d) * 60;
        //             var m = Math.floor(minfloat);
        //             var secfloat = (minfloat - m) * 60;
        //             var s = Math.round(secfloat);
        //             var direction = '';

        //             // if (v < 0 && v >= -180) {
        //             //     direction = 'W';
        //             // } else if (v > 0 && v <= 180) {
        //             //     direction = 'E';
        //             // }

        //             // if (v < 0 && v >= -90) {
        //             //     direction = 'S';
        //             // } else if (v > 0 && v <= 90) {
        //             //     direction = 'N';
        //             // }

        //             if (s == 60) {
        //                 m++;
        //                 s = 0;
        //             }
        //             if (m == 60) {
        //                 d++;
        //                 m = 0;
        //             }
        //             return '' + d + '° ' + m + "' " + s + "'' ";
        //         });
        //     }),
        // );
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
            );
    }

    async created(): Promise<void> {
        await this.$store.dispatch('loading');

        (async () => {
            let generator = RemoteServices.cenotesGenerator(
                500 /* TODO: Change to 15 after adding createdAt & updatedAt attributes */,
            );
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
