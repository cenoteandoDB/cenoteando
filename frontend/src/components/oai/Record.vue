<template>
    <v-row>
        <v-col>
            <v-sheet elevation="2">
                <h2 class="pa-10 pb-2">Metadata</h2>
                <xml-viewer :xml="this.$attrs.xml" class="pa-10 pt-2" />
            </v-sheet>
        </v-col>
        <v-divider class="mx-5" vertical></v-divider>
        <v-col cols="auto">
            <h3>Download Metadata:</h3>
            <v-btn class="ma-3" @click.prevent="downloadXML()">XML</v-btn>
            <!-- TODO: Create and link backend endpoints for downloading data (JSON or CSV) -->

            <v-divider class="my-5"></v-divider>

            <h3>Download Data:</h3>
            <v-btn class="ma-3" @click.prevent="downloadJSON()">JSON</v-btn>
            <v-btn class="ma-3" @click.prevent="downloadCSV()">CSV</v-btn>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import XmlViewer from 'vue-xml-viewer';
import { parseAsync } from 'json2csv';

import RemoteServices from '@/services/RemoteServices';
import CenoteDTO from '@/models/CenoteDTO';

@Component({ components: { XmlViewer } })
export default class Record extends Vue {
    cenote: CenoteDTO | null = null;

    id(): string {
        return this.$attrs.id.split(':')[2];
    }

    key(): string {
        return this.id().split('/')[1];
    }

    download(data: string, filename: string, type = 'text/plain'): void {
        const blob = new Blob([data], {
            type: type,
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    async downloadXML(): Promise<void> {
        await this.$store.dispatch('loading');
        try {
            this.download(
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
            if (!this.cenote)
                this.cenote = await RemoteServices.getCenote(this.key());
            this.download(
                JSON.stringify(this.cenote),
                'cenote_' + this.key() + '.json',
                'application/json',
            );
        } catch (error) {
            await this.$store.dispatch('error', error);
        }
        await this.$store.dispatch('clearLoading');
    }

    async downloadCSV(): Promise<void> {
        await this.$store.dispatch('loading');
        try {
            if (!this.cenote)
                this.cenote = await RemoteServices.getCenote(this.key());
            parseAsync(this.cenote, {
                // TODO: transforms: [flatten, unwind],
            })
                .then((csv) =>
                    this.download(
                        csv,
                        'cenote_' + this.key() + '.csv',
                        'text/csv',
                    ),
                )
                .catch((err) => {
                    throw err;
                });
        } catch (error) {
            await this.$store.dispatch('error', error);
        }
        await this.$store.dispatch('clearLoading');
    }
}
</script>
