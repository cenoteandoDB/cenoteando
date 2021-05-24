<template>
    <v-row>
        <v-col>
            <v-sheet elevation="2">
                <h3 class="pa-5">Metadata</h3>
                <xml-viewer :xml="this.$attrs.xml" class="pa-10" />
            </v-sheet>
        </v-col>
        <v-divider class="mx-5" vertical></v-divider>
        <v-col cols="auto">
            <h3>Download Metadata:</h3>
            <v-btn
                class="ma-3"
                @click.prevent="
                    downloadData(this.$attrs.xml, 'metadata.xml', 'text/xml')
                "
                >XML</v-btn
            >
            <!-- TODO: Create and link backend endpoints for downloading data (JSON or CSV) -->

            <v-divider class="my-5"></v-divider>

            <h3>Download Data:</h3>
            <v-btn class="ma-3">JSON</v-btn>
            <v-btn class="ma-3">CSV</v-btn>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import XmlViewer from 'vue-xml-viewer';

@Component({ components: { XmlViewer } })
export default class Record extends Vue {
    downloadData(data: string, filename: string, type = 'text/plain'): void {
        const blob = new Blob([data], {
            type: type,
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
    }
}
</script>
