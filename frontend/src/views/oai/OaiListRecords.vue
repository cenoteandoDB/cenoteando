<template>
    <v-container class="mt-10">
        <v-row class="mb-10 mx-1">
            <h2>List of Records</h2>
            <v-spacer></v-spacer>
            <span v-if="oai">
                Response date:
                <small>
                    {{ responseDate.toLocaleString() }}
                </small>
            </span>
        </v-row>
        <v-expansion-panels multiple>
            <v-expansion-panel
                v-for="record in records"
                :key="record.identifier"
            >
                <v-expansion-panel-header>
                    <span>
                        Identifier:
                        <small>{{ record.identifier }}</small>
                    </span>
                    <v-spacer></v-spacer>
                    <span>
                        Last Modified:
                        <small>{{
                            record.datestamp.toLocaleDateString()
                        }}</small>
                    </span>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                    <v-row>
                        <v-col>
                            <xml-viewer :xml="record.xml" />
                        </v-col>
                        <v-col>
                            <v-card-actions class="mx-5">
                                <!-- TODO: Create and link backend endpoints for downloading JSON and CSV -->
                                <v-btn>JSON</v-btn>
                                <v-btn>CSV</v-btn>
                            </v-card-actions>
                        </v-col>
                    </v-row>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import RemoteServices from '@/services/RemoteServices';
import XmlViewer from 'vue-xml-viewer';
import { ElementCompact, js2xml } from 'xml-js';
import { parseISOString } from '@/services/ConvertDateService';

@Component({ components: { XmlViewer } })
export default class OaiListRecords extends Vue {
    oai: ElementCompact | null = null;
    responseDate: Date | null = null;
    records: Array<{
        identifier: string;
        datestamp: Date;
        xml: string;
    }> = [];

    async created(): Promise<void> {
        await this.$store.dispatch('loading');
        try {
            this.oai = await RemoteServices.listRecords();
            if (this.oai['OAI-PMH'].error)
                throw new Error(this.oai['OAI-PMH'].error._text);
            this.responseDate = parseISOString(
                this.oai['OAI-PMH'].responseDate._text,
            );
            this.records = this.oai['OAI-PMH'].ListRecords.record.map(
                (record) => {
                    return {
                        identifier: record.header.identifier._text,
                        datestamp: parseISOString(
                            record.header.datestamp._text,
                        ),
                        xml: js2xml({ record: record }, { compact: true }),
                    };
                },
            );
        } catch (error) {
            await this.$store.dispatch('error', error);
        }
        await this.$store.dispatch('clearLoading');
    }
}
</script>
