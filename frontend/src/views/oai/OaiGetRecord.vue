<template>
    <v-container class="mt-10">
	<div id="Tittle">
        <v-row class="mb-10 mx-1">
            <h2>GET RECORD</h2>
        </v-row>
	</div>
	<br />
        <!-- TODO: Create and link backend endpoints for downloading JSON and CSV -->
        <!-- TODO: Layout -->
	<div id="search">
        <span>Identifier:</span>
	<div id="identifier">
        <v-text-field v-model="identifier"></v-text-field>
	</div>
	</div>
	<br />
	<div id="bottoms" style="display:flex">
	<div id="bottom">
        <v-btn v-on:click="getRecordXml">Get Record</v-btn>
	</div>
	<div id="download">
	<v-btn class="downBO" v-on:click="download">Download metadata</v-btn>
	</div>
	</div>
	<br />
	<div id="xml_section">
	<span>Metadata:</span>
	<div id="xml">
        <xml-viewer :xml="xml" />
	</div>
	</div>
    </v-container>
</template>
<style> @import './style.css'; </style>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import RemoteServices from '@/services/RemoteServices';
import XmlViewer from 'vue-xml-viewer';

@Component({ components: { XmlViewer } })
export default class OaiListRecords extends Vue {
    xml = '';
    identifier = 'oai:cenoteando.org:Cenotes/1';
    down= 'dowload metadata';
    async created(): Promise<void> {
        await this.getRecordXml();
    }

    async getRecordXml(): Promise<void> {
        await this.$store.dispatch('loading');
        try {
            this.xml = await RemoteServices.getRecordXml(this.identifier);
        } catch (error) {
            await this.$store.dispatch('error', error);
        }
        await this.$store.dispatch('clearLoading');
    }
	
    async download(): Promise<void> {
	const url = './metadate_cenote.txt';
	window.open(url);
}
}
</script>
