<template>
    <v-container class="mt-5">
        <v-row>
            <v-col>
                <h2>Get Record</h2>
            </v-col>
        </v-row>
        <v-row align="center" justify="center">
            <v-col cols="12">
                <v-text-field
                    v-model="identifier"
                    label="Identifier"
                    single-line
                    dense
                    filled
                    rounded
                    v-on:keyup.enter="getRecordXml"
                    append-outer-icon="mdi-magnify"
                    @click:append-outer="getRecordXml"
                ></v-text-field>
            </v-col>
        </v-row>
        <v-divider></v-divider>
        <record :xml="xml" :id="identifier"></record>
    </v-container>
</template>

<script lang="ts">
import Record from '@/components/oai/Record.vue';
import RemoteServices from '@/services/RemoteServices';
import { Component, Vue } from 'vue-property-decorator';

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
