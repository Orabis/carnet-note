import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles.css'
import ToastPlugin from 'vue-toast-notification'
const app = createApp(App)

app.use(router).use(ToastPlugin)

app.mount('#app')
