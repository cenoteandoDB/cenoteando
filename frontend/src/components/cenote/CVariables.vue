<template>
    <v-container>
        <v-row class="pt-10">
            <v-col class="d-flex justify-center">
                <v-spacer></v-spacer>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <h3 x-large v-bind="attrs" v-on="on" dense>M</h3>
                    </template>
                    <span>Distance in meters</span>
                </v-tooltip>

                <v-spacer></v-spacer>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <h3 x-large v-bind="attrs" v-on="on" dense>M</h3>
                    </template>
                    <span>Distance in meters</span>
                </v-tooltip>

                <v-spacer></v-spacer>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <h3 x-large v-bind="attrs" v-on="on" dense>M</h3>
                    </template>
                    <span>Distance in meters</span>
                </v-tooltip>

                <v-spacer></v-spacer>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <h3 x-large v-bind="attrs" v-on="on" dense>M</h3>
                    </template>
                    <span>Distance in meters</span>
                </v-tooltip>

                <v-spacer></v-spacer>
            </v-col>
        </v-row>
        <v-row>
            <v-col class="d-flex justify-center mx-auto">
                <v-spacer></v-spacer>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <h3 x-large v-bind="attrs" v-on="on" dense>M</h3>
                    </template>
                    <span>Distance in meters</span>
                </v-tooltip>

                <v-spacer></v-spacer>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <h3 x-large v-bind="attrs" v-on="on" dense>M</h3>
                    </template>
                    <span>Distance in meters</span>
                </v-tooltip>

                <v-spacer></v-spacer>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <h3 x-large v-bind="attrs" v-on="on" dense>M</h3>
                    </template>
                    <span>Distance in meters</span>
                </v-tooltip>

                <v-spacer></v-spacer>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <h3 x-large v-bind="attrs" v-on="on" dense>M</h3>
                    </template>
                    <span>Distance in meters</span>
                </v-tooltip>

                <v-spacer></v-spacer>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class CVariables extends Vue {
    currentTab = 1;
}
</script>

<style scoped lang="scss"></style>
