import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import socketService from './services/socketService'
import { apply_seo } from './lib/seo'

// Initialize socket service
socketService.init()

const app = createApp(App)

app.use(router)
app.mount('#app')

router.afterEach((to) => {
  try {
    apply_seo(to)
  } catch { }
})