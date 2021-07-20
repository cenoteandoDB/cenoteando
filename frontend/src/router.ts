import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Home from '@/views/Home.vue';
import Map from '@/views/Map.vue';
import Cenote from '@/views/Cenote.vue';
import Login from '@/components/auth/Login.vue';
import SignUp from '@/components/auth/SignUp.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/oai-pmh',
        component: () => import('@/views/oai/OaiPmh.vue'),
        children: [
            {
                path: '',
                name: 'OaiPmh',
                component: () => import('@/views/oai/OaiIdentify.vue'),
            },
            {
                path: 'identify',
                name: 'OaiIdentify',
                component: () => import('@/views/oai/OaiIdentify.vue'),
            },
            {
                path: 'get-record',
                name: 'OaiGetRecord',
                component: () => import('@/views/oai/OaiGetRecord.vue'),
            },
            {
                path: 'list-records',
                name: 'OaiListRecords',
                component: () => import('@/views/oai/OaiListRecords.vue'),
            },
        ],
    },
    {
        path: '/map',
        name: 'Map',
        component: Map,
    },
    {
        path: '/cenote/:key',
        name: 'Cenote',
        component: Cenote,
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
    },
    {
        path: '/sign-up',
        name: 'SignUp',
        component: SignUp,
    },
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
});

export default router;
