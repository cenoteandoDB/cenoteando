<template>
    <v-container>
        <v-row class="pt-10">
            <v-col
                class="d-flex justify-center"
                v-for="variable in variables"
                :key="variable._key"
            >
                <v-spacer></v-spacer>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <!--<v-icon
    x-large
    color="green"
    v-bind="attrs"
    v-on="on"
    v-if="variable._key"
    dense
>{{ icons[variable._key] }}</v-icon>
 -->
                        <h3
                            v-bind="attrs"
                            v-on="on"
                            v-if="variable.values[0].value === true"
                        >
                            green
                        </h3>

                        <h3
                            v-bind="attrs"
                            v-on="on"
                            v-if="variable.values[0].value === false"
                        >
                            red
                        </h3>
                        <h3
                            v-bind="attrs"
                            v-on="on"
                            v-if="
                                variable.values[0].value !== true &&
                                variable.values[0].value !== false
                            "
                        >
                            other
                        </h3>

                        <!--<h3 v-bind="attrs" v-on="on" v-if="variable._key">
                            {{ variable.name }}</h3>-->
                    </template>
                    <span class="mx-auto">{{ variable.description }}</span>
                </v-tooltip>

                <v-spacer></v-spacer>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import VariableDTO from '@/models/VariableDTO';
import CenoteDTO from '@/models/CenoteDTO';
import RemoteServices from '@/services/RemoteServices';

@Component
export default class GeneralTab extends Vue {
    variables: VariableDTO[] = [];
    cenote: CenoteDTO | null = null;
    currentTab = 0;
    icons = {
        swimming: 'mdi-swim',
    };

    async created(): Promise<void> {
        await this.$store.dispatch('loading');
        try {
            this.variables = await RemoteServices.getData(
                this.$route.params.key,
                'TOURISM',
            );
        } catch (error) {
            await this.$store.dispatch('error', error);
        }
        await this.$store.dispatch('clearLoading');
    }
}
</script>

<style scoped lang="scss"></style>
