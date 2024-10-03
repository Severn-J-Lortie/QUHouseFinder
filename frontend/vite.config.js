import fs from 'node:fs';
import { fileURLToPath, URL } from 'node:url'
import path from 'node:path';
import dotenv from 'dotenv';

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite';
import {PrimeVueResolver} from '@primevue/auto-import-resolver';

const dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(dirname, '../.env') });

console.log(process.env.QU_KEY_PATH && process.env.QU_CERT_PATH);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    Components({
      resolvers: [
        PrimeVueResolver()
      ]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    https: process.env.QU_KEY_PATH && process.env.QU_CERT_PATH
      ? {
          key: fs.readFileSync(process.env.QU_KEY_PATH),
          cert: fs.readFileSync(process.env.QU_CERT_PATH),
        }
      : false,
    port: 5173,
  }
})
