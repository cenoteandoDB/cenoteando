import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Home from "../views/Home.vue";
import OaiPmh from "../views/oai/OaiPmh.vue";
import OaiIdentify from "../views/oai/OaiIdentify.vue";
import OaiGetRecord from "../views/oai/OaiGetRecord.vue";
import OaiListIdentifiers from "../views/oai/OaiListIdentifiers.vue";
import OaiListRecords from "../views/oai/OaiListRecords.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/oai-pmh",
    name: "OAI-PMH",
    component: OaiPmh,
    children: [
      {
        path: "",
        name: "OAI-PMH Identify",
        component: OaiIdentify,
      },
      {
        path: "identify",
        name: "OAI-PMH Identify",
        component: OaiIdentify,
      },
      {
        path: "get-record",
        name: "OAI-PMH Get Record",
        component: OaiGetRecord,
      },
      {
        path: "list-identifiers",
        name: "OAI-PMH List Identifiers",
        component: OaiListIdentifiers,
      },
      {
        path: "list-records",
        name: "OAI-PMH List Records",
        component: OaiListRecords,
      },
    ],
  },

  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
