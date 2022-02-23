<template>
    <v-container fluid>
        <v-row align="center" justify="space-around">
            <v-col cols="auto">
                <v-row align="center" justify="center">
                    <v-col cols="auto">
                        <h3>Download Data</h3>
                    </v-col>
                </v-row>
                <v-row align="center" justify="space-around">
                    <v-col cols="auto">
                        <v-btn class="ma-3" @click.prevent="downloadJSON()"
                            >JSON</v-btn
                        >
                    </v-col>
                    <v-col cols="auto">
                        <v-btn class="ma-3" @click.prevent="downloadCSV()"
                            >CSV</v-btn
                        >
                    </v-col>
                </v-row>
            </v-col>
            <v-col cols="auto">
                <v-row>
                    <v-col cols="auto">
                        <h3>Download Metadata</h3>
                    </v-col>
                </v-row>
                <v-row align="center" justify="space-around">
                    <v-col cols="auto">
                        <v-btn class="ma-3" @click.prevent="downloadXML()"
                            >XML</v-btn
                        >
                    </v-col>
                </v-row>
            </v-col>
            <v-col cols="auto">
                <v-row>
                    <v-col cols="auto">
                        <h3>Visit Cenote Page</h3>
                    </v-col>
                </v-row>
                <v-row align="center" justify="space-around">
                    <v-col cols="auto">
                        <v-btn class="ma-3" :to="'/cenote/' + this.key()">
                            Cenote
                        </v-btn>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
        <v-divider class="my-3"></v-divider>
        <v-row>
            <v-col cols="12">
                <h2 class="pb-2">Metadata</h2>
                <v-sheet elevation="2" class="overflow-auto">
                    <xml-viewer :xml="this.$attrs.xml" class="pa-3" />
                </v-sheet>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import FileService from '@/services/FileService';
import RemoteServices from '@/services/RemoteServices';
import { parseAsync, transforms } from 'json2csv';
import { Component, Vue } from 'vue-property-decorator';
import XmlViewer from 'vue-xml-viewer';


@Component({ components: { XmlViewer } })
export default class Record extends Vue {
    id(): string {
        return this.$attrs.id.split(':')[2];
    }

    key(): string {
        return this.id().split('/')[1];
    }

    async downloadXML(): Promise<void> {
        await this.$store.dispatch('loading');
        try {
            FileService.download(
                this.$attrs.xml,
                'metadata_cenote_' + this.key() + '.xml',
                'text/xml',
            );
        } catch (error) {
            await this.$store.dispatch('error', error);
        }
        await this.$store.dispatch('clearLoading');
    }

    async downloadJSON(): Promise<void> {
        await this.$store.dispatch('loading');
        try {
            const cenote = await RemoteServices.getCenote(this.key());
            FileService.download(
                JSON.stringify(cenote),
                'cenote_' + this.key() + '.json',
                'application/json',
            );
        } catch (error) {
            await this.$store.dispatch('error', error);
        }
        await this.$store.dispatch('clearLoading');
    }

    // TODO: Get this from backend
    async downloadCSV(): Promise<void> {
        await this.$store.dispatch('loading');
        try {
            const cenote = await RemoteServices.getCenote(this.key());

            const fields = Object.keys(transforms.flatten()(cenote));
            const csv = await parseAsync(cenote, {
                fields,
                transforms: [
                    transforms.flatten(),
                    transforms.unwind({
                        paths: [
                            'properties.alternative_names',
                            'properties.issues',
                            'properties.contacts',
                        ],
                        blankOut: true,
                    }),
                    transforms.flatten(),
                ],
            });
            FileService.download(
                csv,
                'cenote_' + this.key() + '.csv',
                'text/csv',
            );
        } catch (error) {
            await this.$store.dispatch('error', error);
        }
        await this.$store.dispatch('clearLoading');
    }
}
</script>
