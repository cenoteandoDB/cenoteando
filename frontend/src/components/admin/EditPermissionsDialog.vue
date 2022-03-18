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
                        small-chips
                        outlined
                        label="Variable Whitelist"
                    ></v-select>
                    <v-select
                        v-if="user.role === 'CENOTERO_ADVANCED'"
                        v-model="themeBlackList"
                        :items="filteredVariableBlackList()"
                        multiple
                        chips
                        small-chips
                        outlined
                        label="Variable Blacklist"
                    ></v-select>
                    <v-autocomplete
                        v-model="cenoteWhiteList"
                        :items="filteredCenoteWhiteList()"
                        chips
                        small-chips
                        outlined
                        label="Cenote Whitelist"
                        multiple
                    ></v-autocomplete>
                    <v-autocomplete
                        v-if="user.role === 'CENOTERO_ADVANCED'"
                        v-model="cenoteBlackList"
                        :items="filteredCenoteBlackList()"
                        chips
                        small-chips
                        outlined
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

@Component({
    props: {
        user: UserDTO,
        cenote: [],
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

    cenoteToDisplay(cenote: CenoteDTO): string {
        return cenote.id + ' - ' + cenote.name;
    }

    cenoteDisplayToId(display: string): string {
        return display.split(' - ')[0];
    }

    filteredVariableBlackList(): string[] {
        return this.themes.filter((t) => {
            return !this.themeWhiteList.includes(t);
        });
    }

    filteredVariableWhiteList(): string[] {
        return this.themes.filter((t) => {
            return !this.themeBlackList.includes(t);
        });
    }

    filteredCenoteBlackList(): string[] {
        return this.$props.cenote
            .map(this.cenoteToDisplay)
            .filter((c: string) => {
                return !this.cenoteWhiteList.includes(c);
            });
    }

    filteredCenoteWhiteList(): string[] {
        return this.$props.cenote
            .map(this.cenoteToDisplay)
            .filter((c: string) => {
                return !this.cenoteBlackList.includes(c);
            });
    }

    cenoteIdToDisplay(id: string): string {
        for (var cenote of this.$props.cenote) {
            if (cenote.id == id) return this.cenoteToDisplay(cenote);
        }
        return id + ' - Not Found';
    }

    async getCenotes(): Promise<void> {
        await this.$store.dispatch('loading');
        try {
            let generator = RemoteServices.cenotesGenerator(30);
            for await (let batch of generator) {
                this.$props.cenote.push(...batch);
            }
        } catch (error) {
            await this.$store.dispatch('error', error);
        }
        await this.$store.dispatch('clearLoading');
    }

    async created(): Promise<void> {
        if (this.$props.user.themesWhiteList) {
            this.themeWhiteList = this.$props.user.themesWhiteList;
        }
        if (this.$props.user.themesBlackList) {
            this.themeBlackList = this.$props.user.themesBlackList;
        }
        if (this.$props.user.cenoteWhiteList) {
            this.cenoteWhiteList = this.$props.user.cenoteWhiteList.map(
                this.cenoteIdToDisplay,
            );
        }
        if (this.$props.user.cenoteBlackList) {
            this.cenoteBlackList = this.$props.user.cenoteBlackList.map(
                this.cenoteIdToDisplay,
            );
        }
    }

    save(): void {
        this.$props.user.themesWhiteList = this.themeWhiteList;
        this.$props.user.themesBlackList = this.themeBlackList;
        this.$props.user.cenoteWhiteList = this.cenoteWhiteList.map(
            this.cenoteDisplayToId,
        );
        this.$props.user.cenoteBlackList = this.cenoteBlackList.map(
            this.cenoteDisplayToId,
        );

        this.$emit('onSave');
        this.dialog = false;
    }
}
</script>
