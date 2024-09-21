import 'primeicons/primeicons.css';
import './style.css';
import PrimeVue from 'primevue/config';
import Noir from './presets/Noir.js';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createAuth0 } from '@auth0/auth0-vue';

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
app.use(
  createAuth0({
    domain: 'dev-kbje3rlq4xojtkj0.us.auth0.com',
    clientId: 'SoOd8mrCyalX2T8Dp3m5SzdfEBKSG9xY',
    redirect_uri: window.location.origin
  })
);

app.mount('#app')
