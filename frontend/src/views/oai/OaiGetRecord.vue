<template>
    <v-container class="mt-10">
        <v-row class="mb-10">
            <h2>Get Record</h2>
        </v-row>
        <v-row>
            <v-text-field
                v-model="identifier"
                label="Identifier"
                single-line
                dense
                filled
                rounded
                v-on:keyup.enter="getRecordXml"
            ></v-text-field>
            <v-btn v-on:click="getRecordXml" class="ml-5 mt-1"
                >Get Record</v-btn
            >
        </v-row>
        <v-divider class="my-10"></v-divider>
        <record :xml="xml" :id="identifier"></record>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import RemoteServices from '@/services/RemoteServices';
import Record from '@/components/oai/Record.vue';

@Component({ components: { Record } })
export default class OaiListRecords extends Vue {
    xml = '';
    identifier = 'oai:cenoteando.org:Cenotes/1';

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
}
</script>
