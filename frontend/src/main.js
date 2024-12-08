import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import axios from 'axios'

// Set the API base URL dynamically using environment variable
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'; // for local dev

createApp(App).mount('#app');
