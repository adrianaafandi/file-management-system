import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import axios from 'axios'

// Configure axios base URL
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

createApp(App).mount('#app')
