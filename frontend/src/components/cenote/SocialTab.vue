<template>
    <v-container>
        <v-card elevation="2" class="mx-auto">
            <v-virtual-scroll :items="comments" height="400" item-height="175">
                <template v-slot:default="{ item }">
                    <v-container>
                        <v-row align="center" justify="space-between">
                            <v-col cols="auto">
                                <v-btn
                                    v-if="item.source === 'GOOGLE_PLACES'"
                                    icon
                                    :href="item.url"
                                    target="_blank"
                                    class="pt-5 pl-5"
                                >
                                    <v-img :src="logos[1].src" :width="30">
                                    </v-img>
                                </v-btn>
                                <v-btn
                                    v-else-if="item.source === 'TRIPADVISOR'"
                                    icon
                                    :href="item.url"
                                    target="_blank"
                                    class="pt-5 pl-5"
                                >
                                    <v-img :src="logos[0].src" :width="30">
                                    </v-img>
                                </v-btn>
                            </v-col>

                            <v-spacer></v-spacer>
                            <v-col cols="auto">
                                <v-rating
                                    :value="item.rating"
                                    color="amber"
                                    dense
                                    half-increments
                                    readonly
                                    size="14"
                                    class="pt-5 pr-5"
                                ></v-rating>
                            </v-col>
                        </v-row>
                        <v-row class="mb-16">
                            <v-col>
                                <v-card-text
                                    class="text-justify"
                                    size="x-larger"
                                    >{{ item.text }}
                                </v-card-text>
                            </v-col>
                        </v-row>
                    </v-container>
                </template>
            </v-virtual-scroll>
        </v-card>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CommentDTO from '@/models/CommentDTO';
import RemoteServices from '@/services/RemoteServices';

@Component
export default class SocialTab extends Vue {
    comments: CommentDTO[] = [];

    logos = [
        {
            src: require('@/assets/tripadvisor.jpg'),
            alt: 'tripadvisor logo',
            height: '30',
        },
        {
            src: require('@/assets/google.png'),
            alt: 'google logo',
            white_only: false,
            height: '30',
        },
    ];

    currentTab = 2;
    async created(): Promise<void> {
        await this.$store.dispatch('loading');
        try {
            this.comments = await RemoteServices.getComments(
                this.$route.params.key,
            );
        } catch (error) {
            await this.$store.dispatch('error', error);
        }
        await this.$store.dispatch('clearLoading');
    }
}
</script>

<style scoped lang="scss"></style>
