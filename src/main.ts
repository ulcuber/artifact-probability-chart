import './assets/sass/main.scss';

import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';

import errors from './plugins/errors';

import App from './App.vue';

const i18n = createI18n({
  legacy: false,
  locale: navigator?.language?.split('-')[0] || 'en',
  fallbackLocale: 'en',
  messages: { en: {}, ru: {} },
});

createApp(App)
  .use(i18n)
  .use(errors)
  .mount('#app');
