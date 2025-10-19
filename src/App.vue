<script setup lang="ts">
import { inject } from 'vue';

import { errorsKey } from './plugins/errors';

import AppHeader from './components/AppHeader.vue';
import ArtifactsSelectors from './components/ArtifactsSelectors.vue';

const { errors, clear } = inject(errorsKey)!;
</script>

<template>
  <AppHeader />
  <ArtifactsSelectors />
  <div v-if="errors.length">
    <button type="button" @click="clear">
      Clear
    </button>
    <ul>
      <li v-for="error in errors" :key="error.message">
        <b>{{ error.message }}</b>
        <template v-if="error.context">
          <div>{{ error.context.from }}</div>
          <div v-if="error.context.source">
            <i>{{ error.context.source }}</i>
          </div>
          <div v-if="error.context.stack">
            <pre>{{ error.context.stack }}</pre>
          </div>
        </template>
      </li>
    </ul>
  </div>
  <footer class="gi-footer">
    <p>
      Genshin Impact™ is a registered trademark of hoYoverse Co., Ltd. This site is not affiliated with or endorsed by hoYoverse
    </p>
  </footer>
</template>

<style lang="scss" scoped>
@use "./assets/sass/gi";

.gi-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, rgba(42, 42, 42, 0.95) 0%, rgba(26, 26, 26, 0.98) 100%);
  border-top: 2px solid gi.$border-gold;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  position: relative;
  margin-top: 1rem;

  p {
    color: gi.$text-primary;
  }
}
</style>
