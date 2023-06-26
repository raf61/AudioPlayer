import './assets/main.css'
import router from './router'
import { createApp } from 'vue'
import App from './App.vue'
import store from './store'

createApp(App)
.use(store)
.use(router)
.mount('#app')

router.push('/')
