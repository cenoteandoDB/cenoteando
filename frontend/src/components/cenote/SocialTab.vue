<template>
    <v-container>
        <v-card elevation="2" max-width="500" class="mx-auto">
            <v-virtual-scroll
                :bench="benched"
                :items="comments"
                height="400"
                item-height="150"
            >
                <template v-slot:default="{ item }">
                    <v-row class="pt-3">
                        <v-col class="d-flex justify-center m-10">
                            <v-spacer></v-spacer>

                            <v-container v-if="item.source === 'GOOGLE_PLACES'">
                                <v-btn icon :href="item.url" target="_blank">
                                    <v-img :src="logos[1].src" :width="30">
                                    </v-img>
                                </v-btn>
                            </v-container>

                            <v-container v-if="item.source === 'TRIPADVISOR'">
                                <v-btn icon :href="comment.url" target="_blank">
                                    <v-img :src="logos[0].src" :width="30">
                                    </v-img>
                                </v-btn>
                            </v-container>

                            <v-spacer></v-spacer>
                            <v-rating
                                :value="item.rating"
                                color="amber"
                                dense
                                half-increments
                                readonly
                                size="14"
                                class="pt-3 pr-3"
                            ></v-rating>
                        </v-col>
                    </v-row>
                    <v-card-text class="pr-10 text-justify" size="x-larger"
                        >{{ item.text }}
                    </v-card-text>
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
