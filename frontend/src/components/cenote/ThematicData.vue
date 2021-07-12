<template>
    <v-container>
        <v-tabs v-model="currentTab" fixed-tabs slider-color="amber darken-3">
            <v-tab v-for="tab in tabs" :key="tab">
                {{ tab }}
            </v-tab>

            <v-tabs-items v-model="currentTab">
                <v-tab-item v-for="theme in tabs" :key="theme">
                    <br />
                    <v-row
                        v-for="variable in variables[theme]"
                        :key="variable._key"
                    >
                        <v-col cols="auto">
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                    <b
                                        class="text-decoration-underline"
                                        v-bind="attrs"
                                        v-on="on"
                                        >{{ variable.name }}:</b
                                    >
                                </template>
                                {{ variable.description }}
                            </v-tooltip>
                            {{ variable.values[0].value }}
                        </v-col>
                        <v-spacer></v-spacer>
                        <v-col cols="auto">
                            <small>{{ variable.values[0].timestamp }}</small>
                        </v-col>
                    </v-row>
                </v-tab-item>
            </v-tabs-items>
        </v-tabs>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import VariableDTO from '@/models/VariableDTO';
import RemoteServices from '@/services/RemoteServices';

@Component({})
export default class ThematicData extends Vue {
    variables: { [theme: string]: VariableDTO[] } = {};
    currentTab = null;
    tabs = [
        'LOCATION',
        'GEOREFERENCE',
        'CULTURAL',
        'GEOMORPHOLOGY',
        'BIODIVERSITY',
        'DISTURBANCE',
        'TOURISM',
        'DIVING',
        'ORGANIZATION',
        'REGULATION',
        'WATER',
    ];

    async created(): Promise<void> {
        this.tabs.forEach((theme) => {
            RemoteServices.getData(this.$route.params.key, theme)
                .then((vars) => Vue.set(this.variables, theme, vars))
                .catch((error) => this.$store.dispatch('error', error));
        });
    }
}
</script>

<style scoped lang="scss"></style>
