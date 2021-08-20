<template>
    <v-card class="table">
        <v-data-table
            :headers="headers"
            :items="filteredUsers"
            :items-per-page="15"
            :search="search"
            class="elevation-1"
        >
            <template v-slot:top>
                <v-card-title>
                    <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        label="Search"
                        class="mx-2"
                    />
                </v-card-title>

                <v-expansion-panels>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            Filters
                        </v-expansion-panel-header>

                        <v-expansion-panel-content>
                            <v-select
                                v-model="filterRole"
                                :items="roles"
                                label="Roles"
                                multiple
                                chips
                                hint="User roles"
                                persistent-hint
                            ></v-select>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </template>

            <template v-slot:[`item.action`]="{ item }">
                <edit-user-dialog :user="item" @onSave="updateUser(item)">
                    <template v-slot:activator="{ on, attrs }">
                        <v-icon
                            class="mr-2 action-button"
                            v-on="on"
                            v-bind="attrs"
                            color="green"
                            data-cy="editUser"
                            >mdi-pencil</v-icon
                        >
                    </template>
                </edit-user-dialog>

                <delete-dialog @onConfirm="deleteUser(item)" />
            </template>
        </v-data-table>
    </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import UserDTO from '@/models/UserDTO';
import RemoteServices from '@/services/RemoteServices';
import EditUserDialog from '@/components/admin/EditUserDialog.vue';
import DeleteDialog from '@/components/admin/DeleteDialog.vue';

@Component({
    components: {
        EditUserDialog,
        DeleteDialog,
    },
})
export default class Users extends Vue {
    headers = [
        { text: 'Name', value: 'name' },
        { text: 'Email', value: 'email' },
        { text: 'Role', value: 'role' },
        { text: 'Actions', value: 'action' },
    ];

    roles = [
        'CENOTERO',
        'OWNER',
        'REGIONAL_MANAGER',
        'THEMATIC_MANAGER',
        'ADMIN',
    ];

    search = '';
    filterRole: string[] = [];

    users: UserDTO[] = [];

    get filteredUsers(): UserDTO[] {
        return this.users.filter(
            (u) => !this.filterRole.length || this.filterRole.includes(u.role),
        );
    }

    async created(): Promise<void> {
        await this.$store.dispatch('loading');

        (async () => {
            let generator = RemoteServices.usersGenerator(
                500 /* TODO: Change to 15 after adding createdAt & updatedAt attributes */,
            );
            for await (let batch of generator) {
                if (!this.users.length)
                    await this.$store.dispatch('clearLoading');

                this.users.push(...batch);
            }
        })().catch(async (error) => {
            await this.$store.dispatch('error', error);
        });
    }

    async updateUser(user: UserDTO): Promise<void> {
        await this.$store.dispatch('loading');

        try {
            await RemoteServices.updateUser(user);
        } catch (error) {
            // TODO: revert to original value in case of failure
            await this.$store.dispatch('error', error);
        }

        await this.$store.dispatch('clearLoading');
    }

    async deleteUser(user: UserDTO): Promise<void> {
        await RemoteServices.deleteUser(user._key);
        this.users = this.users.filter((u) => u._key != user._key);
    }
}
</script>
