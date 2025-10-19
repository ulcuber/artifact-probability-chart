const factorials = [0, 1, 2, 6, 24, 120, 720, 5040];

export function permutation(n, r) {
  const delta = n - r;

  if (delta === 0) return 1;

  return factorials[n] / factorials[delta];
}

export function combination(n, r) {
  if (r === 0) return 1;

  const delta = n - r;

  if (delta === 0) return 1;

  return factorials[n] / (factorials[r] * factorials[delta]);
}

export function binominalProbability(trials: int, successes: int, successProbability: float) {
  const n = trials;
  const k = successes;
  const p = successProbability;

  return combination(n, k) * (p ** k) * ((1 - p) ** (n - k));
}

// for same probability per success
export function multinominalProbability(successes: int[], successProbability: float) {
  const trials = successes.reduce((sum, v) => sum + v, 0);

  if (trials === 0) {
    return 1;
  }

  const coefficient = successes.reduce(
    (acc, v) => acc / factorials[v],
    factorials[trials],
  );

  const probability = successes.reduce(
    (acc, v) => acc * successProbability ** v,
    1,
  );

  return coefficient * probability;
}

export function expectedTrials(probability: float): int {
  return Math.ceil(1 / probability);
}

export function trialsForConfidence(probability: float, confidence: float): int {
  return Math.ceil(Math.log(1 - confidence) / Math.log(1 - probability));
}

// NOTE: original resin is simply resin
const MINUTES_IN_DAY = 24 * 60;
const MINUTES_PER_RESIN = 8;
const DAILY_RESIN = MINUTES_IN_DAY / MINUTES_PER_RESIN;

// const CONDENSED_RESIN_COST = 60;
const FRAGILE_RESIN_COST = 60; // WEAK
const TRANSIENT_RESIN_COST = 60;

const BATTLEPASS_FR_COUNT = 5;
const BP_RESIN = FRAGILE_RESIN_COST * BATTLEPASS_FR_COUNT;

const SERENITYPOT_TR_COUNT = 1;
const SERENITYPOT_RESIN = TRANSIENT_RESIN_COST * SERENITYPOT_TR_COUNT;

const TOTAL_DAILY_RESIN = DAILY_RESIN + BP_RESIN / 50 + SERENITYPOT_RESIN / 7;
const TRIAL_RESIN_COST = 20;
const DOUBLE_ARTIFACT_PROBABILITY = 0.065;

const DAILY_TRIALS = (TOTAL_DAILY_RESIN * (1 + DOUBLE_ARTIFACT_PROBABILITY)) / TRIAL_RESIN_COST;

export function trialsToDays(trials: int): int {
  return Math.ceil(
    trials / DAILY_TRIALS,
  );
}
