import { CLASSIC_DEFENSE_LAYERS, findBlockedTechnique } from '@/utils/injectionDetector';

/** Mentions of the thing Merlin is guarding. */
const TARGET_PATTERN = /spell|password|secret|word|incantation|magic|phrase/i;

export const BREACH_SCORE = {
  win: 100,
  blocked: 10,
  base: 15,
  target: 20,
  freshTechnique: 20,
  effort: 10,
} as const;

/** Highest score a failed attempt can reach, so the meter never implies a win that didn't happen. */
export const MAX_FAILED_SCORE =
  BREACH_SCORE.base + BREACH_SCORE.target + BREACH_SCORE.freshTechnique + BREACH_SCORE.effort;

/**
 * Deterministic 0-100 "breach meter" score for a Classic attempt. There is no
 * model behind this: it rewards the things that move a player toward a win -
 * aiming at the secret, reaching for a technique Merlin hasn't warded yet, and
 * putting effort into the prompt - and drops sharply when a ward catches it.
 */
export function scoreBreach(prompt: string, level: number, isSuccessful: boolean): number {
  if (isSuccessful) return BREACH_SCORE.win;
  const text = prompt.trim();
  if (text.length < 2) return 0;
  if (findBlockedTechnique(text, level)) return BREACH_SCORE.blocked;

  let score = BREACH_SCORE.base;
  if (TARGET_PATTERN.test(text)) score += BREACH_SCORE.target;
  const usesFreshTechnique = CLASSIC_DEFENSE_LAYERS.some(
    (layer) => layer.wardedFrom > level && layer.patterns.some((p) => p.test(text))
  );
  if (usesFreshTechnique) score += BREACH_SCORE.freshTechnique;
  if (text.split(/\s+/).length >= 6) score += BREACH_SCORE.effort;
  return Math.min(score, MAX_FAILED_SCORE);
}

export type BreachTier = 'none' | 'cold' | 'warm' | 'hot' | 'breached';

export function breachTier(score: number | undefined): BreachTier {
  if (score === undefined) return 'none';
  if (score >= BREACH_SCORE.win) return 'breached';
  if (score >= 50) return 'hot';
  if (score >= 30) return 'warm';
  return 'cold';
}

export const BREACH_TIER_LABEL: Record<BreachTier, string> = {
  none: 'Send a message to test the wards',
  cold: 'Merlin barely noticed',
  warm: 'Getting warmer',
  hot: 'The wards are straining',
  breached: 'Breached!',
};
