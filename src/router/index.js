import { createWebHistory, createRouter } from "vue-router";
import Panel from '../views/Panel.vue'
import Manage from '../views/Manage.vue'
const routes = [
    {
        path: '/',
        component: Panel,
        name:'panel'
    },
    {
        path:'/manage',
        component: Manage,
        name:'manage'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router