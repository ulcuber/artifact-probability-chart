import { fileURLToPath, URL } from 'node:url';
import { resolve, dirname } from 'node:path';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// eslint-disable-next-line
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import vueDevTools from 'vite-plugin-vue-devtools';
import manifestSRI from 'vite-plugin-manifest-sri';

const VITE_BASE_URL = process.env.VITE_BASE_URL || 'https://ulcuber.github.io';
const baseUrl = `${VITE_BASE_URL}/artifact-probability-chart`;

// https://vite.dev/config/
export default defineConfig({
  base: baseUrl,
  plugins: [
    manifestSRI(),
    vue(),
    VueI18nPlugin({
      // locale messages resource pre-compile option
      include: resolve(
        dirname(fileURLToPath(import.meta.url)),
        './lang/**',
      ),
    }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    allowedHosts: [
      'artifacts.test',
    ],
  },
});
