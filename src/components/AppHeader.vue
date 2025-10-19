<template>
  <header class="gi-header">
    <label class="language-selector">
      <select v-model="$i18n.locale" class="gi-select">
        <option v-for="lang in $i18n.availableLocales" :key="`lang-${lang}`" :value="lang">
          {{ lang }}
        </option>
      </select>
    </label>
  </header>
</template>

<style lang="scss" scoped>
@use "sass:color";

@use "../assets/sass/gi";

.gi-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, rgba(42, 42, 42, 0.95) 0%, rgba(26, 26, 26, 0.98) 100%);
  border-bottom: 2px solid gi.$border-gold;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  position: relative;
  margin-bottom: 1rem;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg,
      transparent 0%,
      gi.$border-gold 20%,
      gi.$border-gold 80%,
      transparent 100%);
  }
}

.language-selector {
  display: flex;
  align-items: center;

  &::before {
    content: '🌐';
    margin-right: 0.5rem;
    font-size: 1.1rem;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
  }
}

.gi-select {
  background: gi.$option-bg;
  border: 1px solid gi.$border-gold;
  border-radius: 4px;
  color: gi.$text-primary;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  min-width: 4rem;
  transition: all 0.3s ease;
  position: relative;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23d3bc8e' d='M6 8L2 4h8z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.7rem center;
  background-size: 12px;
  appearance: none;

  &:hover {
    background-color: color.adjust(gi.$option-bg, $lightness: 5%);
    border-color: color.adjust(gi.$border-gold, $lightness: 10%);
    box-shadow: 0 0 8px rgba(211, 188, 142, 0.3);
  }

  &:focus {
    outline: none;
    background-color: color.adjust(gi.$option-bg, $lightness: 8%);
    box-shadow: 0 0 0 2px rgba(211, 188, 142, 0.4);
  }

  option {
    background: gi.$dark-bg;
    color: gi.$text-primary;
    padding: 0.5rem;

    &:hover {
      background: gi.$gold;
      color: gi.$dark-bg;
    }

    &:checked {
      background: gi.$gold;
      color: gi.$dark-bg;
    }
  }
}

@media (max-width: 768px) {
  .gi-header {
    padding: 0.8rem 1rem;
    justify-content: center;
  }

  .gi-select {
    font-size: 0.85rem;
  }
}
</style>
