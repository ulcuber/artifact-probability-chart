<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  LogarithmicScale,
  PointElement,
  CategoryScale,
} from 'chart.js';

import { ATTRIBUTE, WRONG_SET_PROBABILITY } from '../dict';
import { expectedTrials, trialsToDays, trialsForConfidence } from '../utils';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  LogarithmicScale,
  PointElement,
  CategoryScale,
);

const props = defineProps({
  title: { type: String, required: true },
  main: { type: Number, required: true },
  mainLabel: { type: [Number, String, null], required: true },
  artifactSlots: { type: Array as () => number[], required: true },
  slotsLabels: { type: Array as () => (ATTRIBUTE | null)[], required: true },
  upgrades: { type: Number, required: true },
});

const { t } = useI18n({});

const labels = computed(() => [
  t('set'),
  ATTRIBUTE[props.mainLabel] || '',
  ...props.slotsLabels.map((a, i) => String(i + 1) + ' ' + (ATTRIBUTE[a] || '')),
  t('upgrades'),
]);

function makeOptions({ title, min, max, callback }) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      customCanvasBackgroundColor: {
        color: '#2a2a2a', // $dark-bg
      },
      title: {
        display: Boolean(title),
        text: title,
        color: '#d3bc8e', // $gold
        font: {
          size: 16,
          weight: 'bold',
          family: '\'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif',
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      legend: {
        position: 'top',
        labels: {
          color: '#e9e5dc', // $text-primary
          font: {
            size: 12,
            family: '\'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif',
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: '#3a3a3a', // $option-bg
        titleColor: '#d3bc8e', // $gold
        bodyColor: '#e9e5dc', // $text-primary
        borderColor: '#b8975e', // $border-gold
        borderWidth: 1,
        cornerRadius: 4,
        titleFont: {
          size: 12,
          weight: 'bold',
        },
        bodyFont: {
          size: 11,
        },
        padding: 10,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(184, 180, 169, 0.1)', // $text-secondary with opacity
          borderColor: '#b8975e', // $border-gold
        },
        ticks: {
          color: '#b8b4a9',
          font: {
            size: 11,
            family: '\'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif',
          },
        },
        border: {
          color: '#b8975e', // $border-gold
        },
      },
      y: {
        type: 'logarithmic',
        min,
        max, // (1) but for reserving space for points
        grid: {
          color: 'rgba(184, 180, 169, 0.1)', // $text-secondary with opacity
          borderColor: '#b8975e', // $border-gold
        },
        ticks: {
          callback,
          color: '#b8b4a9', // $text-secondary
          font: {
            size: 11,
            family: '\'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif',
          },
        },
        border: {
          color: '#b8975e', // $border-gold
        },
      },
    },
    animation: {
      duration: 750,
      easing: 'easeOutQuart',
    },
    elements: {
      line: {
        tension: 0, borderWidth: 2,
      },
      point: {
        radius: 4, hoverRadius: 6, borderWidth: 2,
      },
      bar: {
        borderWidth: 1, borderRadius: 2, borderSkipped: false,
      },
      arc: {
        borderWidth: 1, borderColor: '#1a1a1a', // $darker-bg
      },
    },
  };
}

const options = computed(() => makeOptions({
  title: props.title,
  min: 0,
  max: 3, // (1) but for reserving space for points
  callback(v) {
    let percent = v * 100;
    if (percent < 0.001) {
      percent = percent.toExponential(3);
    }
    return `${percent}%`;
  },
}));

const trialsOptions = computed(() => makeOptions({
  min: 0,
}));

const daysOptions = computed(() => makeOptions({
  min: 0,
}));

const confidenceOptions = computed(() => makeOptions({
  min: 0,
}));

const giColorSchemes = {
  primary: ['#d3bc8e', '#b8975e', '#e9e5dc', '#b8b4a9', '#3a3a3a'],
  vibrant: ['#d3bc8e', '#b8975e', '#c4a86a', '#e5d5b8', '#f2e8d0'],
  muted: ['#8a7a56', '#6b5d3f', '#9c8e6b', '#b8b4a9', '#7a7568'],
};

const data = computed(() => [
  WRONG_SET_PROBABILITY,
  props.main,
  ...props.artifactSlots,
  props.upgrades,
]);

const sumData = computed(() => {
  let sum = 1;
  return data.value.map((p) => {
    sum *= p;
    return sum;
  });
});

const trialsData = computed(() => sumData.value.map(expectedTrials));

const daysData = computed(() => trialsData.value.map(trialsToDays));

const confidenceThresholds = [0.63212157064355428778, 0.75, 0.85, 0.95, 0.99];
const confidenceLabels = confidenceThresholds.map(c => `${Math.floor(c * 100)}%`);

const confidenceData = computed(() => confidenceThresholds.map((confidence) => {
  const probability = sumData.value[sumData.value.length - 1];

  const trials = trialsForConfidence(probability, confidence);

  return trialsToDays(trials);
}));

function dataset(theme, data) {
  return {
    backgroundColor: giColorSchemes[theme][0],
    borderColor: giColorSchemes[theme][1],
    borderWidth: 2,
    pointBackgroundColor: giColorSchemes[theme][2],
    pointBorderColor: giColorSchemes[theme][1],
    ...data,
  };
}

const chart = computed(() => ({
  labels: labels.value,
  datasets: [
    dataset('vibrant', {
      label: t('probability'),
      data: data.value,
    }),
    dataset('primary', {
      label: t('sum-probability'),
      data: sumData.value,
    }),
  ],
}));

const trialsChart = computed(() => ({
  labels: labels.value,
  datasets: [
    dataset('primary', {
      label: t('n-of-trials'),
      data: trialsData.value,
    }),
  ],
}));

const daysChart = computed(() => ({
  labels: labels.value,
  datasets: [
    dataset('primary', {
      label: t('n-of-days'),
      data: daysData.value,
    }),
  ],
}));

const confidenceChart = computed(() => ({
  labels: confidenceLabels,
  datasets: [
    dataset('primary', {
      label: t('n-of-days'),
      data: confidenceData.value,
    }),
  ],
}));
</script>

<template>
  <div class="chart-container">
    <Line
      :options="options"
      :data="chart"
      :plugins="[]"
    />
  </div>
  <div class="chart-container">
    <Line
      :options="trialsOptions"
      :data="trialsChart"
      :plugins="[]"
    />
  </div>
  <div class="chart-container">
    <Line
      :options="daysOptions"
      :data="daysChart"
      :plugins="[]"
    />
  </div>
  <div class="chart-container">
    <Line
      :options="confidenceOptions"
      :data="confidenceChart"
      :plugins="[]"
    />
  </div>
</template>

<style lang="scss" scoped>
@use "../assets/sass/gi";

// prevents infinite resize
.chart-container {
  position: relative;
  height: 40vh;
  background: linear-gradient(135deg, gi.$darker-bg 0%, gi.$dark-bg 100%);
}
.chart-container:first-child {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}
.chart-container:last-child {
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}
</style>

<i18n lang="json">
{
  "en": {
    "probability": "Probability",
    "sum-probability": "Probability sum",
    "n-of-trials": "Trials",
    "n-of-days": "Days",
    "upgrades": "Upgrades",
    "set": "Set"
  },
  "ru": {
    "probability": "Вероятность",
    "sum-probability": "Суммарная вероятность",
    "n-of-trials": "Попыток",
    "n-of-days": "Дней",
    "upgrades": "Улучшения",
    "set": "Набор"
  }
}
</i18n>
