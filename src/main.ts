import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@/scss/_vars.scss'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAppConfigStore } from '@/store/useAppConfigStore' // Import the new store
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'

//modo oscuro bootstrap
//  document.documentElement.setAttribute('data-bs-theme', 'dark')

//crear y usar instancia de pinia para estado global
const pinia = createPinia()
pinia.use(piniaPluginPersistedState)
const app = createApp(App)

app.use(router)
app.use(pinia)

// Initialize the app config store
const appConfigStore = useAppConfigStore()
appConfigStore.initialize()

app.mount('#app')
