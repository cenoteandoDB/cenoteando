<template>
    <v-container>
        <v-row class="pt-10 pl-10 pr-10">
            <v-col class="d-flex justify-center m-10">
                <v-spacer></v-spacer>

                <v-avatar class="p-10" color="primary" size="40"></v-avatar>

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

                <v-card-text class="pr-10 text-justify" size="x-larger"
                    >At vero eos et accusamus et iusto odio dignissimos ducimus
                    qui blanditiis praesentium voluptatum deleniti atque
                    corrupti quos dolores et quas molestias excepturi sint
                    occaecati cupiditate non provident, similique sunt in culpa
                    qui officia deserunt mollitia animi, id est laborum et
                    dolorum fuga. Et harum quidem rerum facilis est et expedita
                    distinctio. Nam libero tempore, cum soluta nobis est
                    eligendi optio cumque nihil impedit quo minus id quod maxime
                    placeat facere possimus, omnis voluptas assumenda est, omnis
                    dolor repellendus. Temporibus autem quibusdam et aut
                    officiis debitis aut rerum necessitatibus saepe eveniet ut
                    et voluptates repudiandae sint et molestiae non recusandae.
                    Itaque earum rerum hic tenetur a sapiente delectus, ut aut
                    reiciendis voluptatibus maiores alias consequatur aut
                    perferendis doloribus asperiores repellat.
                </v-card-text>

                <v-spacer></v-spacer>
            </v-col>
        </v-row>
        <v-row class="pt-10 pl-10 pr-10">
            <v-col class="d-flex justify-center m-10">
                <v-spacer></v-spacer>

                <v-avatar class="p-10" color="primary" size="40"></v-avatar>

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

                <v-card-text class="pr-10 text-justify" size="x-larger"
                    >At vero eos et accusamus et iusto odio dignissimos ducimus
                    qui blanditiis praesentium voluptatum deleniti atque
                    corrupti quos dolores et quas molestias excepturi sint
                    occaecati cupiditate non provident, similique sunt in culpa
                    qui officia deserunt mollitia animi, id est laborum et
                    dolorum fuga. Et harum quidem rerum facilis est et expedita
                    distinctio. Nam libero tempore, cum soluta nobis est
                    eligendi optio cumque nihil impedit quo minus id quod maxime
                    placeat facere possimus, omnis voluptas assumenda est, omnis
                    dolor repellendus. Temporibus autem quibusdam et aut
                    officiis debitis aut rerum necessitatibus saepe eveniet ut
                    et voluptates repudiandae sint et molestiae non recusandae.
                    Itaque earum rerum hic tenetur a sapiente delectus, ut aut
                    reiciendis voluptatibus maiores alias consequatur aut
                    perferendis doloribus asperiores repellat.
                </v-card-text>

                <v-spacer></v-spacer>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class SocialTab extends Vue {
    currentTab = 2;
}
</script>

<style scoped lang="scss"></style>
