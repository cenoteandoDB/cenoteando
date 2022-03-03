<template>
    <v-dialog v-model="dialog" max-width="600px">
        <template v-slot:activator="{ on, attrs }">
            <slot name="activator" v-bind:on="on" v-bind:attrs="attrs"> </slot>
        </template>

        <v-card class="pt-5 mt-5 justify-center">
            <v-card-title>
                <span class="text-h5">Permissions</span>
            </v-card-title>
            <v-card-text>
                <v-form v-model="valid">
                    <v-select
                        v-model="variableWhiteList"
                        :items="themes"
                        multiple
                        chips
                        outlined
                        small-chips
                        menu-props="auto"
                        dense
                        label="Variable Whitelist"
                    ></v-select>
                    <v-select
                        v-if="user.role === 'CENOTERO_ADVANCED'"
                        v-model="variableBlackList"
                        :items="themes"
                        multiple
                        chips
                        outlined
                        small-chips
                        menu-props="auto"
                        dense
                        label="Variable Blacklist"
                    ></v-select>
                    <v-autocomplete
                        v-model="cenoteWhiteList"
                        :items="cenoteNames.map(((c) => {
                            return c.id + '-' +c.name 
                        }))"
                        dense
                        chips
                        outlined
                        small-chips
                        menu-props="auto"
                        label="Cenote Whitelist"
                        multiple
                    ></v-autocomplete>
                    <v-autocomplete
                        v-if="user.role === 'CENOTERO_ADVANCED'"
                        v-model="cenoteBlackList"
                        :items="cenoteNames.map(((c) => {
                            return c.id + '-' + c.name 
                        }))"
                        dense
                        chips
                        outlined
                        small-chips
                        menu-props="auto"
                        label="Cenote Blacklist"
                        multiple
                    ></v-autocomplete>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="dialog = false">
                    Close
                </v-btn>
                <v-btn
                    color="blue darken-1"
                    text
                    :disabled="!this.valid"
                    @click="save()"
                >
                    Save
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script lang="ts">
import CenoteDTO from '@/models/CenoteDTO';
import UserDTO, { UserRole } from '@/models/UserDTO';
import RemoteServices from '@/services/RemoteServices';
import { Component, Vue } from 'vue-property-decorator';

interface CenoteData {
    id: string;
    name: string;
    cenote: CenoteDTO;
}

@Component({
    props: {
        user: UserDTO,
    },
})
export default class EditPermissionsDialog extends Vue {
    cenoteWhiteList = [];
    cenoteBlackList = [];
    variableWhiteList = [];
    variableBlackList = [];

    themes = [
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
    dialog = false;
    valid = false;
    roles = Object.values(UserRole);

    cenotes: CenoteDTO[] = [];

    get cenoteNames(): CenoteData[] {
        return this.cenotes.map((c) => {
            return {
                id: c.id.toString(),
                name: c.name,
                cenote: c,
            };
        });
    }

    async created(): Promise<void> {
        await this.$store.dispatch('loading');

        (async () => {
            let generator = RemoteServices.cenotesGenerator(30);
            for await (let batch of generator) {
                if (!this.cenotes.length)
                    await this.$store.dispatch('clearLoading');
                this.cenotes.push(...batch);
            }
        })().catch(async (error) => {
            await this.$store.dispatch('error', error);
        });
    }

    save(): void {
        this.cenoteNames.map((c)=>{
            return c.id;
        })
        this.$emit('onSave');
        this.dialog = false;
    }
}
</script>
