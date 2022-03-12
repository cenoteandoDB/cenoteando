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
                        v-model="themeWhiteList"
                        :items="filteredVariableWhiteList()"
                        multiple
                        chips
                        outlined
                        small-chips
                        dense
                        label="Variable Whitelist"
                    ></v-select>
                    <v-select
                        v-if="user.role === 'CENOTERO_ADVANCED'"
                        v-model="themeBlackList"
                        :items="filteredVariableBlackList()"
                        multiple
                        chips
                        outlined
                        small-chips
                        dense
                        label="Variable Blacklist"
                    ></v-select>
                    <v-autocomplete
                        v-model="cenoteWhiteList"
                        :items="filteredCenoteWhiteList()"
                        dense
                        chips
                        outlined
                        small-chips
                        label="Cenote Whitelist"
                        multiple
                    ></v-autocomplete>
                    <v-autocomplete
                        v-if="user.role === 'CENOTERO_ADVANCED'"
                        v-model="cenoteBlackList"
                        :items="filteredCenoteBlackList()"
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
}

@Component({
    props: {
        user: UserDTO,
    },
})
export default class EditPermissionsDialog extends Vue {
    cenoteWhiteList: string[] = [];
    cenoteBlackList: string[] = [];
    themeWhiteList: string[] = [];
    themeBlackList: string[] = [];

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

    filteredVariableBlackList() {
        return this.themes.filter((t) => {
            if (this.themeBlackList.length >= 0)
                return !this.themeWhiteList.includes(t);
            else {
                return t;
            }
        });
    }

    filteredVariableWhiteList() {
        return this.themes.filter((t) => {
            if (this.themeWhiteList.length >= 0)
                return !this.themeBlackList.includes(t);
            else {
                return t;
            }
        });
    }

    filteredCenoteBlackList() {
        var cenoteNameId = this.cenoteNames.map((c) => {
            return c.id + ' - ' + c.name;
        });

        return cenoteNameId.filter((c) => {
            if (this.cenoteBlackList.length >= 0) {
                return !this.cenoteWhiteList.includes(c);
            } else {
                return c;
            }
        });
    }

    filteredCenoteWhiteList() {
        var cenoteNameId = this.cenoteNames.map((c) => {
            return c.id + ' - ' + c.name;
        });

        return cenoteNameId.filter((c) => {
            if (this.cenoteWhiteList.length >= 0) {
                return !this.cenoteBlackList.includes(c);
            } else {
                return c;
            }
        });
    }

    get cenoteNames(): CenoteData[] {
        return this.cenotes.map((c) => {
            return {
                id: c.id.toString(),
                name: c.name,
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

            if (this.$props.user.themesWhiteList) {
                this.themeWhiteList = this.$props.user.themesWhiteList;
            }
            if (this.$props.user.themesBlackList) {
                this.themeBlackList = this.$props.user.themesBlackList;
            }
            if (this.$props.user.cenotesWhiteList) {
                this.cenoteWhiteList = this.$props.user.cenotesWhiteList;
            }
            if (this.$props.user.cenotesBlackList) {
                this.cenoteBlackList = this.$props.user.cenotesBlackList;
            }
        })().catch(async (error) => {
            await this.$store.dispatch('error', error);
        });
    }

    save(): void {
        this.$props.user.themesWhiteList = this.themeWhiteList;
        this.$props.user.themesBlackList = this.themeBlackList;

        this.$props.user.cenotesBlackList = this.cenoteBlackList.map((c) => {
            return c.split(' ')[0];
        });

        this.$props.user.cenotesWhiteList = this.cenoteWhiteList.map((c) => {
            return c.split(' ')[0];
        });

        console.log(this.$props.user);
        this.$emit('onSave');
        this.dialog = false;
    }
}
</script>
