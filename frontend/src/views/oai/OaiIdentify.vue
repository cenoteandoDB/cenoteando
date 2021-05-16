<template>
<section>
<div id="main" style="display: flex;">
<div id="variables_name">
	<article>
	    <h3>Name Repository:</h3>
	    <br />
	    <h3>Base URL:</h3>
	    <br />
	    <h3>Prococol Version:</h3>
	    <br />
	    <h3> E-Mail Contact:</h3>
	    <br />
	    <h3> Earliest Datestamp:</h3>
	    <br />
	    <h3> Deleted Record:</h3>
	    <br />
	    <h3>Granularity:</h3>
	</article>
</div>
<div id="data_identify">
	<article>
	    <h3 class="data"> Cenoteando</h3>
	    <br />
	    <h3 class="data"> https://cenoteando.org/oai/request</h3>
	    <br />
	    <h3 class="data"> 2.0</h3>
	    <br />
	    <h3 class="data"> cenoteando@gmail.com</h3>
	    <br />
	    <h3 class="data"> 2021-01-01T00:00:00z</h3>
	    <br />
	    <h3 class="data"> no </h3>
	    <br />
	    <h3 class="data"> YYYY-MM-DDThh:mm:ssZ</h3>
	</article>
</div>
</div>
</section>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
    name: 'OaiIdentify',
});
</script>

<style> @import './style.css';</style>
