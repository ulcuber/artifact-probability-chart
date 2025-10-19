<script lang="ts" setup>
import { computed } from 'vue';

import flower from '../assets/png/artifacts/flower.png';
import plume from '../assets/png/artifacts/plume.png';
import sands from '../assets/png/artifacts/sands.png';
import goblet from '../assets/png/artifacts/goblet.png';
import circlet from '../assets/png/artifacts/circlet.png';

const props = defineProps({
  name: { type: String, required: true },
});

const imageMap = {
  flower, plume, sands, goblet, circlet,
};

const imageUrl = computed(() => imageMap[props.name]);
</script>

<template>
  <img :src="imageUrl" :alt="name" class="artifact-image">
</template>
