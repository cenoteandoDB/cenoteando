<template>
    <v-container>
        <v-row class="pt-10">
            <v-col
                class="d-flex justify-center"
                v-for="variable in variables"
                :key="variable._key"
            >
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-icon
                            x-large
                            :color="variable.values[0].value ? 'green' : 'red'"
                            v-bind="attrs"
                            v-on="on"
                        >
                            {{ icons[variable._key] }}
                        </v-icon>
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
        camping: 'mdi-tent',
        showers: 'mdi-shower-head',
        cycleRental: 'mdi-bike',
        businessHoursIn: 'mdi-calendar-arrow-left', // TODO: FIND OUT IF IT WORKS
        businessHoursOut: 'mdi-calendar-arrow-right', // TODO: FIND OUT IF IT WORKS
        horseRide: 'mdi-horse-human',
        truckRide: 'mdi-truck',
        birdWatching: 'mdi-bird',
        socialEvents: 'mdi-account-group', // TODO: FIND A BETTER ICON POSSIBLY
        foodSnacks: 'mdi-food',
        restaurant: 'mdi-silverware-fork-knife',
        restrooms: 'mdi-paper-roll-outline',
        dressingRoom: 'mdi-wardrobe',
        lockers: 'mdi-locker-multiple',
        tourGuide: 'mdi-directions',
        masksRental: 'mdi-diving-snorkel',
        lifesaverRental: 'mdi-lifebuoy',
        cabinsRooms: 'mdi-bed-empty',

        // TODO: Fix these icons
        zipline: 'mdi-help-circle',
        kayakRental: 'mdi-help-circle',
        rappel: 'mdi-help-circle',
        temazcal: 'mdi-help-circle',
    };

    async created(): Promise<void> {
        await this.$store.dispatch('loading');
        try {
            this.variables = await RemoteServices.getData(
                this.$route.params.key,
                'TOURISM',
            );
            // TODO: Make this more robust after updating variable data types in DB
            this.variables = this.variables.filter(
                (variable) => typeof variable.values[0].value === 'boolean',
            );
        } catch (error) {
            await this.$store.dispatch('error', error);
        }
        await this.$store.dispatch('clearLoading');
    }
}
</script>

<style scoped lang="scss"></style>
