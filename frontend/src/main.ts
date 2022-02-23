import CompositionApi from '@vue/composition-api';
import Vue from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import './registerServiceWorker';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

Vue.use(CompositionApi);

new Vue({
    vuetify,
    router,
    store,
    beforeCreate() {
        this.$store.commit('initializeStore');
    },
    render: (h) => h(App),
}).$mount('#app');
