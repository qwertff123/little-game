import {
    createRouter,
    createWebHistory
} from "vue-router";

const routes = [{
        path: "/",
        component: () => import("../pages/home.vue")
    },
    {
        path: "/snack",
        component: () => import("../pages/snack.vue")
    },{
        path : "/eatDoug",
        component : ()=>import("../pages/eatDoug.vue")
    }
]

export default new createRouter({
    routes,
    history: createWebHistory()
})