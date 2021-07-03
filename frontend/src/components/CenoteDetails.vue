<template>
    <v-sheet elevation="2" style="min-height: 500px">
        <v-tabs fixed-tabs v-model="tab">
            <v-tabs-slider color="amber darken-3"></v-tabs-slider>
            <v-tab
                v-for="(tab, index) in tabs"
                :class="{ active: currentTab === index }"
                @click="currentTab = index"
                :key="tab"
            >
                {{ tab }}
            </v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
            <v-card flat>
                <div v-show="currentTab === 0"><general-tab /></div>

                <div v-show="currentTab === 1"><c-variables /></div>
                <div v-show="currentTab === 2">
                    <v-row class="pt-10 pl-10 pr-10">
                        <v-col class="d-flex justify-center m-10">
                            <v-spacer></v-spacer>

                            <v-avatar
                                class="p-10"
                                color="primary"
                                size="40"
                            ></v-avatar>

                            <v-card-text>User Name</v-card-text>
                            <v-spacer></v-spacer>
                            <v-rating
                                :value="4.5"
                                color="amber"
                                dense
                                half-increments
                                readonly
                                size="14"
                            ></v-rating>

                            <v-spacer></v-spacer>
                        </v-col>
                    </v-row>
                    <v-row class="pl-10 m-10">
                        <v-col class="d-flex justify-center mx-auto">
                            <v-spacer></v-spacer>

                            <v-card-text size="x-larger"
                                >At vero eos et accusamus et iusto odio
                                dignissimos ducimus qui blanditiis praesentium
                                voluptatum deleniti atque corrupti quos dolores
                                et quas molestias excepturi sint occaecati
                                cupiditate non provident, similique sunt in
                                culpa qui officia deserunt mollitia animi, id
                                est laborum et dolorum fuga. Et harum quidem
                                rerum facilis est et expedita distinctio. Nam
                                libero tempore, cum soluta nobis est eligendi
                                optio cumque nihil impedit quo minus id quod
                                maxime placeat facere possimus, omnis voluptas
                                assumenda est, omnis dolor repellendus.
                                Temporibus autem quibusdam et aut officiis
                                debitis aut rerum necessitatibus saepe eveniet
                                ut et voluptates repudiandae sint et molestiae
                                non recusandae. Itaque earum rerum hic tenetur a
                                sapiente delectus, ut aut reiciendis
                                voluptatibus maiores alias consequatur aut
                                perferendis doloribus asperiores repellat.
                            </v-card-text>

                            <v-spacer></v-spacer>
                        </v-col>
                    </v-row>
                </div>
                <div v-show="currentTab === 3">
                    <v-card-text>Content</v-card-text>
                </div>
                <div v-show="currentTab === 4">
                    <v-card-text>Content</v-card-text>
                </div>
            </v-card>
        </v-tabs-items>
    </v-sheet>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import GeneralTab from '@/components/GeneralTab.vue';
import CVariables from '@/components/CVariables.vue';

@Component({ components: { GeneralTab, CVariables } })
export default class CenoteDetails extends Vue {
    currentTab = 0;
    tab = null;
    tabs = [
        'General',
        'Calculated Variables',
        'Social',
        'Thematic Data',
        'Sources',
    ];
}
</script>

<style scoped lang="scss"></style>
