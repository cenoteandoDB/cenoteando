<template>
    <v-container class="mt-5">
        <v-row class="mb-10" align="center" justify="space-between">
            <v-col cols="auto">
                <h2>Identify</h2>
            </v-col>
            <v-col cols="auto" v-if="identifyDTO">
                Response date:
                <small>
                    {{ identifyDTO.response_date.toLocaleString() }}
                </small>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-simple-table
                    v-if="identifyDTO"
                    class="elevation-1 align-center"
                >
                    <tbody>
                        <tr
                            v-for="[key, value] of Object.entries(identifyDTO)"
                            :key="key"
                        >
                            <td class="font-weight-bold pl-5">
                                {{ camelCaseToTitleCase(key) }}
                            </td>
                            <td>{{ value }}</td>
                        </tr>
                    </tbody>
                </v-simple-table>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import IdentifyDTO from '@/models/oai/IdentifyDTO';
import RemoteServices from '@/services/RemoteServices';
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class OaiIdentify extends Vue {
    identifyDTO: IdentifyDTO | null = null;

    async created(): Promise<void> {
        await this.$store.dispatch('loading');
        try {
            this.identifyDTO = await RemoteServices.identify();
        } catch (error) {
            await this.$store.dispatch('error', error);
        }
        await this.$store.dispatch('clearLoading');
    }

    // Source: https://stackoverflow.com/questions/7225407/convert-camelcasetext-to-sentence-case-text
    // Take a single camel case string and convert it to a string of separate words (with spaces) at the camel-case boundaries.
    camelCaseToTitleCase(in_camelCaseString: string): string {
        let result = in_camelCaseString // "__ToGetYourGEDInTimeASongAboutThe26ABCsIsOfTheEssenceButAPersonalIDCardForUser_456InRoom26AContainingABC26TimesIsNotAsEasyAs123ForC3POOrR2D2Or2R2D"
            .replace(/(_)+/g, ' ') // " ToGetYourGEDInTimeASongAboutThe26ABCsIsOfTheEssenceButAPersonalIDCardForUser 456InRoom26AContainingABC26TimesIsNotAsEasyAs123ForC3POOrR2D2Or2R2D"
            .replace(/([a-z])([A-Z][a-z])/g, '$1 $2') // " To Get YourGEDIn TimeASong About The26ABCs IsOf The Essence ButAPersonalIDCard For User456In Room26AContainingABC26Times IsNot AsEasy As123ForC3POOrR2D2Or2R2D"
            .replace(/([A-Z][a-z])([A-Z])/g, '$1 $2') // " To Get YourGEDIn TimeASong About The26ABCs Is Of The Essence ButAPersonalIDCard For User456In Room26AContainingABC26Times Is Not As Easy As123ForC3POOr R2D2Or2R2D"
            .replace(/([a-z])([A-Z]+[a-z])/g, '$1 $2') // " To Get Your GEDIn Time ASong About The26ABCs Is Of The Essence But APersonal IDCard For User456In Room26AContainingABC26Times Is Not As Easy As123ForC3POOr R2D2Or2R2D"
            .replace(/([A-Z]+)([A-Z][a-z][a-z])/g, '$1 $2') // " To Get Your GEDIn Time A Song About The26ABCs Is Of The Essence But A Personal ID Card For User456In Room26A ContainingABC26Times Is Not As Easy As123ForC3POOr R2D2Or2R2D"
            .replace(/([a-z]+)([A-Z0-9]+)/g, '$1 $2') // " To Get Your GEDIn Time A Song About The 26ABCs Is Of The Essence But A Personal ID Card For User 456In Room 26A Containing ABC26Times Is Not As Easy As 123For C3POOr R2D2Or 2R2D"

            // Note: the next regex includes a special case to exclude plurals of acronyms, e.g. "ABCs"
            .replace(/([A-Z]+)([A-Z][a-rt-z][a-z]*)/g, '$1 $2') // " To Get Your GED In Time A Song About The 26ABCs Is Of The Essence But A Personal ID Card For User 456In Room 26A Containing ABC26Times Is Not As Easy As 123For C3PO Or R2D2Or 2R2D"
            .replace(/([0-9])([A-Z][a-z]+)/g, '$1 $2') // " To Get Your GED In Time A Song About The 26ABCs Is Of The Essence But A Personal ID Card For User 456In Room 26A Containing ABC 26Times Is Not As Easy As 123For C3PO Or R2D2Or 2R2D"

            // Note: the next two regexes use {2,} instead of + to add space on phrases like Room26A and 26ABCs but not on phrases like R2D2 and C3PO"
            .replace(/([A-Z]{2,})([0-9]{2,})/g, '$1 $2') // " To Get Your GED In Time A Song About The 26ABCs Is Of The Essence But A Personal ID Card For User 456 In Room 26A Containing ABC 26 Times Is Not As Easy As 123 For C3PO Or R2D2 Or 2R2D"
            .replace(/([0-9]{2,})([A-Z]{2,})/g, '$1 $2') // " To Get Your GED In Time A Song About The 26 ABCs Is Of The Essence But A Personal ID Card For User 456 In Room 26A Containing ABC 26 Times Is Not As Easy As 123 For C3PO Or R2D2 Or 2R2D"
            .trim(); // "To Get Your GED In Time A Song About The 26 ABCs Is Of The Essence But A Personal ID Card For User 456 In Room 26A Containing ABC 26 Times Is Not As Easy As 123 For C3PO Or R2D2 Or 2R2D"
        // capitalize the first letter
        return result.charAt(0).toUpperCase() + result.slice(1);
    }
}
</script>

<style></style>
