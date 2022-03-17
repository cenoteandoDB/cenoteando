<template>
    <v-dialog v-model="dialog" max-width="600px">
        <template v-slot:activator="{ on, attrs }">
            <slot name="activator" v-bind:on="on" v-bind:attrs="attrs"> </slot>
        </template>

        <v-card class="pt-5 mt-5 justify-center">
            <v-card-title>
                <span class="text-h5">User</span>
            </v-card-title>
            <v-card-text>
                <v-form v-model="valid">
                    <v-text-field
                        v-model="user.name"
                        label="Name"
                        :rules="[(v) => !!v || 'Name is required']"
                        required
                    ></v-text-field>

                    <v-text-field
                        v-model="user.email"
                        label="Email"
                        :rules="[
                            (v) => !!v || 'Email is required',
                            (v) =>
                                /.+@.+\..+/.test(v) || 'E-mail must be valid',
                        ]"
                        required
                    ></v-text-field>
                    <v-container class="d-flex d-row">
                        <v-select
                            v-model="user.role"
                            :items="roles"
                            label="Role"
                            :rules="[(v) => !!v || 'Role is required']"
                            required
                        ></v-select>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-icon
                                    class
                                    color="grey"
                                    dark
                                    v-bind="attrs"
                                    v-on="on"
                                >
                                    mdi-help
                                </v-icon>
                            </template>
                            <span v-if="user.role === 'CENOTERO_BASIC'"
                                >A Cenotero (basic) is the most restrictive
                                access role, has the same access as
                                non-registered user, but can be given explicit
                                permission to certain themes and/or
                                cenotes</span
                            >
                            <span v-if="user.role === 'CENOTERO_ADVANCED'"
                                >A Cenotero (advanced) can see all cenotes
                                (except when explicitly forbidden), but can't
                                make any changes on the underlying data</span
                            >
                            <span v-if="user.role === 'RESEARCHER'"
                                >A Researcher has full access to everything in
                                the platform an administrator has access to, but
                                can't delete any data not created by
                                himself</span
                            >
                            <span v-if="user.role === 'ADMIN'"
                                >An Administrator has full access to every
                                non-sensitive datapoint in the platform with no
                                restrictions</span
                            >
                        </v-tooltip>
                    </v-container>
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
import UserDTO, { UserRole } from '@/models/UserDTO';
import { Component, Vue } from 'vue-property-decorator';

@Component({
    props: {
        user: UserDTO,
    },
})
export default class EditUserDialog extends Vue {
    dialog = false;
    valid = false;
    roles = Object.values(UserRole);

    save(): void {
        this.$emit('onSave');
        this.dialog = false;
    }
}
</script>
