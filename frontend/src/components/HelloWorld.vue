<template>
	<v-parallax 
		height="1000"
		width="1000"
		:src="require('@/assets/cenote.jpeg')"
		style="background-size:cover; background-color:rgba(0,0,0,6);"	
>
	<v-container style="border-style:solid; left: 350px; width: 50%; background:rgba(255,255,255, 0.4); position: absolute;top: 20px;">
        <v-row class="text-center">
            <v-col cols="12">
                <v-img
                    :src="require('../assets/logo.png')"
                    class="my-3"
                    contain
                    height="150"
                />
            </v-col>

            <v-col class="mb-4">
                <h1 class="display-2 font-weight-bold mb-3" style="color:black;">
                    Repositorio institucional de cenotes de la facultad de ciencias de la UNAM
                </h1>
            </v-col>
        </v-row>
	</v-container>
	</v-parallax>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'HelloWorld',
});
</script>
