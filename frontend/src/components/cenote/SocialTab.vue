<template>
    <v-container>
        <v-container
            v-for="comment in comments.slice(0, 25)"
            :key="comment._key"
        >
            <v-row class="pt-10 pl-10 pr-10">
                <v-col class="d-flex justify-center m-10">
                    <v-spacer></v-spacer>

                    <v-container v-if="comment.source === 'GOOGLE_PLACES'">
                        <v-btn icon :href="comment.url" target="_blank">
                            <v-img :src="logos[1].src" :width="30"> </v-img>
                        </v-btn>
                    </v-container>

                    <v-container v-if="comment.source === 'TRIPADVISOR'">
                        <v-btn icon :href="comment.url" target="_blank">
                            <v-img :src="logos[0].src" :width="30"> </v-img>
                        </v-btn>
                    </v-container>

                    <v-spacer></v-spacer>
                    <v-rating
                        :value="comment.rating"
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
                        >{{ comment.text }}
                    </v-card-text>

                    <v-spacer></v-spacer>
                </v-col>
            </v-row>
        </v-container>
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
