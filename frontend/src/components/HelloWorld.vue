<template>
<div>
	<v-parallax 
		height="800"
		width="200"
		:src="require('@/assets/cenote5.jpeg')"
		style=""	
>
	<v-container style="border-style:solid; left: 350px; width: 50%; background:rgba(255,255,255, 0.4); position: absolute;top: 20px;">
        <v-row class="text-center">
            <v-col cols="12">
                <v-img
                    :src="require('../assets/cenoteando_logo.png')"
                    class="my-3"
                    contain
                    height="200"
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
<div>
	<v-parallax 
		height="800"
		width="10"
		:src="require('@/assets/cenote1.jpeg')"
		style=""
	>
	</v-parallax>
</div>
<v-parallax
	height="800"
	width="1000"
	:src="require('@/assets/cenote2.jpeg')"
>
</v-parallax>
</div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'HelloWorld',
});
</script>

<style lang="scss" scoped>
.v-parallax__src{
	width: 1000px;
	height: auto;
}

</style>
