<template>
    <v-card class="table mx-8">
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
                <edit-permissions-dialog
                    :user="item"
                    @onSave="updateUser(item)"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-icon
                            v-if="
                                item.role === 'CENOTERO_BASIC' ||
                                item.role === 'CENOTERO_ADVANCED'
                            "
                            class="mr-2 action-button"
                            v-on="on"
                            v-bind="attrs"
                            color="blue"
                            data-cy="editPermissions"
                            >mdi-account-cog</v-icon
                        >
                    </template>
                </edit-permissions-dialog>
            </template>
        </v-data-table>
    </v-card>
</template>

<script lang="ts">
import DeleteDialog from '@/components/admin/DeleteDialog.vue';
import EditPermissionsDialog from '@/components/admin/EditPermissionsDialog.vue';
import EditUserDialog from '@/components/admin/EditUserDialog.vue';
import UserDTO from '@/models/UserDTO';
import CenoteDTO from '@/models/CenoteDTO';
import RemoteServices from '@/services/RemoteServices';
import { Component, Vue } from 'vue-property-decorator';
@Component({
    components: {
        EditUserDialog,
        DeleteDialog,
        EditPermissionsDialog,
    },
})
export default class Users extends Vue {
    headers = [
        { text: 'User ID', value: 'id' },
        { text: 'Name', value: 'name' },
        { text: 'Email', value: 'email' },
        { text: 'Role', value: 'role' },
        { text: 'Actions', value: 'action' },
    ];
    roles = ['ADMIN', 'RESEARCHER', 'CENOTERO_ADVANCED', 'CENOTERO_BASIC'];
    search = '';
    filterRole: string[] = [];
    users: UserDTO[] = [];
    cenotes: CenoteDTO[] = [];
    get filteredUsers(): UserDTO[] {
        return this.users.filter(
            (u) => !this.filterRole.length || this.filterRole.includes(u.role),
        );
    }
    async created(): Promise<void> {
        await this.$store.dispatch('loading');
        (async () => {
            let generator = RemoteServices.usersGenerator(15);
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
        await RemoteServices.deleteUser(user.id);
        this.users = this.users.filter((u) => u.id != user.id);
    }
}
</script>
