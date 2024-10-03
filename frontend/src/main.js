import 'primeicons/primeicons.css';
import './style.css';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Noir from './presets/Noir.js';
import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
      preset: Noir,
      options: {
        prefix: 'p',
        darkModeSelector: '.p-dark',
        cssLayer: false,
    }
  }
});
app.use(ToastService);

app.mount('#app')
