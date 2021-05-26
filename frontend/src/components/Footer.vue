<template>
	<v-footer dark padless style="width= 100%;">
	<v-card class="flex blue darken-3 imagen-center" flat tile>
	<v-layout justify-center aling-center>
	<v-card-text class="text-center">
	<v-btn class="mx-4 white--text text-center" icon href="https://www.facebook.com/cenoteando.unam/">
		<v-icon size="24px">
			{{'mdi-facebook'}}
		</v-icon>
		
	</v-btn>
	<v-btn class="mx-4 white-text" icon href="https://tinyurl.com/yc6ar7zt">
		<v-icon size="24px">
			{{'mdi-youtube'}}
		</v-icon>
	</v-btn>		
	</v-card-text>
	</v-layout>
	<v-layout justify-center aling-center>
	<v-img 
		alt="logo unam"
		class="shrink mr-2"
		contain
		:src="require('@/assets/unam_logo.png')"
		transition="scale-transition"
		width="100"
	/>
	<v-img
		alt="logo ciencias"
		class="shrink mr-2"
		contain
		:src="require('@/assets/ciencias_logo.png')"
		transition="scale-transition"
		width="80"
	/>
	</v-layout>
	</v-card>
	</v-footer>
</template>

<script lang="ts">
</script>


