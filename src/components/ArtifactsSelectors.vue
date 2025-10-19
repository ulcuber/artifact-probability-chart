<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStorage } from '@vueuse/core';

import { ATTRIBUTE, mainAffixProbabilities, minorAffixAttributeWeights,
  MINOR_AFFIX_SLOT_UPGRADE_PROBABILITY, MAX_UPGRADES } from '../dict';
import { multinominalProbability } from '../utils';

import ArtifactImage from './ArtifactImage.vue';
import ArtifactChart from './ArtifactChart.vue';

const { t } = useI18n({});

const weightsSum = computed(
  () => Object.values(minorAffixAttributeWeights).reduce((acc, cur) => acc + cur, 0),
);

const minorAttributes = computed(
  () => Object.keys(minorAffixAttributeWeights),
);

interface Artifact {
  main: ATTRIBUTE
  slots: (ATTRIBUTE | null)[]
  upgrades: (number)[]
}

function makeArtifact(main: ATTRIBUTE): Artifact {
  return {
    main,
    slots: [null, null, null, null],
    upgrades: [0, 0, 0, 0],
  };
}

const defaultArtifacts = {
  flower: makeArtifact(ATTRIBUTE.HP),
  plume: makeArtifact(ATTRIBUTE.ATK),
  sands: makeArtifact(null),
  goblet: makeArtifact(null),
  circlet: makeArtifact(null),
};
const artifacts = useStorage('artifacts', defaultArtifacts);
// artifacts.value = defaultArtifacts;

const orderedMainAttributes = computed(() => Object.values(mainAffixProbabilities).map(
  values => Object.entries(values).sort(
    ([, value1], [, value2]) => value2 - value1,
  ).map(
    ([attr]) => attr,
  ),
));

const orderedMinorAttributes = computed(() => Object.entries(minorAffixAttributeWeights).sort(
  ([, value1], [, value2]) => value2 - value1,
).map(
  ([attr]) => attr,
));

const selectedMainAttributes: Ref<ATTRIBUTE[]> = computed(
  () => Object.values(artifacts.value).map(({ main }) => main),
);

const state = computed(() => Object.entries(artifacts.value).map(([name, artifact], artI) => {
  const excludedMainAttributes = new Set(selectedMainAttributes.value);
  const includedMinorAttributes = new Set(minorAttributes.value);
  let weights = weightsSum.value;

  const mainAttribute = artifact.main;
  const mainProbabilities = mainAffixProbabilities[name];
  const mainProbability = mainProbabilities[mainAttribute] || 1;

  if (mainAttribute !== null) {
    excludedMainAttributes.delete(artifact.main);
    if (includedMinorAttributes.delete(mainAttribute)) {
      weights -= minorAffixAttributeWeights[mainAttribute];
    }
  }

  const slotsOptions: ATTRIBUTE[] = [];
  const slotsProbabilities = artifact.slots.reduce((probabilities, attr) => {
    const options: ATTRIBUTE[] = orderedMinorAttributes.value.filter(
      (minor: ATTRIBUTE) => includedMinorAttributes.has(minor),
    );
    slotsOptions.push(options);

    let probability = 1;
    if (attr !== null) {
      const weight = minorAffixAttributeWeights[attr];
      probability = weight / weights;
      weights -= weight;

      includedMinorAttributes.delete(attr);
      excludedMainAttributes.add(attr);
    }

    probabilities.push(probability);

    return probabilities;
  }, []);

  const mainOptions: ATTRIBUTE[] = orderedMainAttributes.value[artI].filter(
    (main: ATTRIBUTE) => !excludedMainAttributes.has(main),
  );

  const upgrades = artifact.upgrades.filter(Boolean);
  const upgradesProbability = multinominalProbability(upgrades, MINOR_AFFIX_SLOT_UPGRADE_PROBABILITY);
  const upgradesSum = upgrades.reduce((acc, u) => acc + u, 0);

  return {
    mainProbability,
    mainOptions,
    slotsProbabilities,
    slotsOptions,
    upgradesProbability,
    upgradesSum,
  };
}));

function onUpgrade(name, artifactIndex, slotIndex) {
  const sum = state.value[artifactIndex].upgradesSum;
  if (sum < MAX_UPGRADES) {
    if (Number.isInteger(artifacts.value[name].upgrades[slotIndex])) {
      artifacts.value[name].upgrades[slotIndex] += 1;
    }
    else {
      artifacts.value[name].upgrades[slotIndex] = 0;
    }
  }
  else {
    artifacts.value[name].upgrades[slotIndex] = 0;
  }
}
</script>

<template>
  <ul class="artifacts list">
    <li
      v-for="artifact, name, artI in artifacts"
      :key="`artifact-${name}`"
    >
      <div class="artifact-header">
        <div>
          <ArtifactImage class="artifact-image" :name="name" />
        </div>
        <div class="artifact-header__title text-center">
          <strong>{{ t(`artifacts.${name}`) }}</strong>
        </div>
      </div>
      <div class="center-container">
        <div class="artifact-main">
          <select v-model="artifact.main">
            <option v-if="orderedMainAttributes[artI].length > 1" :value="null">
              NONE
            </option>
            <option
              v-for="mainOption in state[artI].mainOptions"
              :key="`artifact-${name}-main-option-${mainOption}`"
              :value="mainOption"
            >
              {{ ATTRIBUTE[mainOption] }}
            </option>
          </select>
        </div>
      </div>
      <div class="center-container">
        <ul class="artifact-slots list">
          <li
            v-for="attr, slotIndex in artifact.slots"
            :key="`artifact-${name}-slot-${slotIndex}`"
          >
            <label>
              <button
                v-if="artifact.upgrades[slotIndex]"
                type="button"
                class="upgrades-button"
                @click.prevent="onUpgrade(name, artI, slotIndex)"
              >
                {{ artifact.upgrades[slotIndex] }}
              </button>
              <button
                v-else
                type="button"
                class="upgrades-button upgrades-button_empty"
                @click.prevent="onUpgrade(name, artI, slotIndex)"
              />
              <select v-model="artifact.slots[slotIndex]">
                <option :value="null">NONE</option>
                <option
                  v-for="slotOption in state[artI].slotsOptions[slotIndex]"
                  :key="`artifact-${name}-slot-${slotIndex}-option-${slotOption}`"
                  :value="slotOption"
                >
                  {{ ATTRIBUTE[slotOption] }}
                </option>
              </select>
            </label>
          </li>
        </ul>
      </div>
    </li>
  </ul>
  <ul class="list">
    <li
      v-for="artifact, name, artI in artifacts"
      :key="`artifact-chart-item-${name}`"
      class="chart-item"
    >
      <ArtifactChart
        :title="t(`artifacts.${name}`)"
        :main="state[artI].mainProbability"
        :main-label="artifact.main"
        :artifact-slots="state[artI].slotsProbabilities"
        :slots-labels="artifact.slots"
        :upgrades="state[artI].upgradesProbability"
      />
    </li>
  </ul>
</template>

<style lang="scss" scoped>
@use "sass:color";

@use "../assets/sass/gi";

.center-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
.text-center {
  text-align: center;
}
.list {
  list-style: none;
  padding-inline-start: 0;
  li {
    list-style: none;
  }
}
.artifacts {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  background: linear-gradient(135deg, gi.$darker-bg 0%, gi.$dark-bg 100%);
  border-radius: 8px;
  padding: 1rem;

  & > * {
    max-width: 19%;
    padding: 1rem 0.5rem;
    margin-bottom: 1%;
    border: 1px solid gi.$border-gold;
    border-radius: 6px;
    background: rgba(42, 42, 42, 0.8);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(50, 50, 50, 0.9);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      transform: translateY(-2px);
    }
  }

  @media (max-width: 1024px) {
    gap: 1%;
    & > * {
      flex-basis: 32.33%;
      min-width: 32.33%;
    }
  }

  @media (max-width: 768px) {
    & > * {
      flex-basis: 49%;
      min-width: 49%;
    }
  }

  @media (max-width: 480px) {
    & > * {
      flex-basis: 100%;
      min-width: 100%;
    }
  }
}
.artifact-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid gi.$border-gold;
  &__title {
    flex-grow: 1;

    strong {
      color: gi.$gold;
      font-size: 1.1rem;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      letter-spacing: 0.5px;
    }
  }
}
.artifact-image {
  min-height: 2rem;
  max-height: 3rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}
.artifact-main {
  margin-top: 0.1rem;
  margin-bottom: 0.8rem;

  & select {
    min-height: 2.5rem;
    width: 100%;
    background: gi.$option-bg;
    border: 1px solid gi.$border-gold;
    border-radius: 4px;
    color: gi.$text-primary;
    padding: 0.5rem;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: color.adjust(gi.$option-bg, $lightness: 5%);
      border-color: color.adjust(gi.$border-gold, $lightness: 10%);
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(211, 188, 142, 0.3);
    }

    option {
      background: gi.$dark-bg;
      color: gi.$text-primary;
      padding: 0.5rem;

      &:hover {
        background: gi.$gold;
        color: gi.$dark-bg;
      }
    }
  }
}
.artifact-slots {
  & > * {
    margin: 0.3rem 0;
    padding: 0.4rem;
    background: rgba(58, 58, 58, 0.6);
    border-radius: 4px;
    border-left: 3px solid gi.$border-gold;

    label {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      width: 100%;

      .upgrades-button {
        color: gi.$dark-bg;
        background-color: gi.$gold;
        text-align: center;
        font-size: 0.9rem;
        width: 1.2rem;
        height: 1.2rem;
        border-radius: 1rem;

        &_empty {
          background-color: gi.$text-secondary;
          width: 0.7rem;
          height: 0.7rem;
          border-radius: 1rem;
          margin-left: 0.25rem;
          margin-right: 0.25rem;
        }
      }

      select {
        flex: 1;
        background: gi.$option-bg;
        border: 1px solid #555;
        border-radius: 3px;
        color: gi.$text-primary;
        padding: 0.3rem;
        font-size: 0.85rem;
        cursor: pointer;

        &:hover {
          border-color: gi.$border-gold;
        }

        option {
          background: gi.$dark-bg;
          color: gi.$text-primary;

          &[value="null"] {
            color: gi.$text-secondary;
            font-style: italic;
          }
        }
      }
    }
  }
}
.chart-item {
  margin-bottom: 0.1rem
}
</style>

<i18n lang="json">
{
  "en": {
    "artifacts": {
      flower: "Flower of Life",
      plume: "Plume of Death",
      sands: "Sands of Eon",
      goblet: "Goblet of Eonothem",
      circlet: "Circlet of Logos"
    }
  },
  "ru": {
    "artifacts": {
      flower: "Цветок жизни",
      plume: "Перо смерти",
      sands: "Пески времени",
      goblet: "Кубок пространства",
      circlet: "Корона разума"
    }
  }
}
</i18n>
