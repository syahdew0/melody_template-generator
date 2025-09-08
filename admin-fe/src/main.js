import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'
import router from './router'
import 'quill/dist/quill.snow.css'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import store from './store'
import { createPinia } from 'pinia'


console.log('App started!')

const app = createApp(App)
app.use(store)
app.use(router)
app.use(Toast)
app.use(createPinia())
app.mount('#app')
