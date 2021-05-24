import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Home from '../views/Home.vue';
import OaiPmh from '../views/oai/OaiPmh.vue';
import OaiIdentify from '../views/oai/OaiIdentify.vue';
import OaiGetRecord from '../views/oai/OaiGetRecord.vue';
import OaiListRecords from '../views/oai/OaiListRecords.vue';
import Repository from '../views/Map.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/oai-pmh',
        component: OaiPmh,
        children: [
            {
                path: '',
                name: 'OaiPmh',
                component: OaiIdentify,
            },
            {
                path: 'identify',
                name: 'OaiIdentify',
                component: OaiIdentify,
            },
            {
                path: 'get-record',
                name: 'OaiGetRecord',
                component: OaiGetRecord,
            },
            {
                path: 'list-records',
                name: 'OaiListRecords',
                component: OaiListRecords,
            },
        ],
    },
    {
        path: '/map',
        name: 'Repository',
        component: Repository,
    },

    {
        path: '/about',
        name: 'About',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
            import(/* webpackChunkName: "about" */ '../views/About.vue'),
    },
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
});

export default router;
