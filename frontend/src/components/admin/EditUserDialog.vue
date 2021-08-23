<template>
    <v-dialog v-model="dialog" max-width="600px">
        <template v-slot:activator="{ on, attrs }">
            <slot name="activator" v-bind:on="on" v-bind:attrs="attrs"> </slot>
        </template>

        <v-card class="pt-5 mt-5 justify-center">
            <v-card-title>
                <!-- TODO: Change title to the name of the user with a pencil icon for editing -->
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

                    <v-select
                        v-model="user.role"
                        :items="roles"
                        label="Role"
                        :rules="[(v) => !!v || 'Role is required']"
                        required
                    ></v-select>
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
import { Component, Vue } from 'vue-property-decorator';
import UserDTO, { UserRole } from '@/models/UserDTO';

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
