import type { PasswordStrengthResult, PasswordStrengthTier } from "../types";

const LABELS: Record<PasswordStrengthTier, string> = {
  empty: "—",
  weak: "Weak",
  fair: "Fair",
  good: "Good",
  strong: "Strong",
};

/**
 * Cheap, deterministic password strength score (no external libs).
 *
 * Returns a numeric score (0–5) translated into a tier so callers can both
 * render the meter and gate the submit button on the same heuristic.
 *
 * Rules considered (each worth 1 point):
 *  - length ≥ 8
 *  - has uppercase
 *  - has lowercase
 *  - has digit
 *  - has symbol
 *
 * Bonus point for length ≥ 12 to differentiate "good" vs "strong".
 */
export const scorePassword = (raw: string): PasswordStrengthResult => {
  if (!raw) {
    return {
      tier: "empty",
      score: 0,
      label: LABELS.empty,
      rules: {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        symbol: false,
      },
    };
  }

  const rules = {
    length: raw.length >= 8,
    uppercase: /[A-Z]/.test(raw),
    lowercase: /[a-z]/.test(raw),
    number: /\d/.test(raw),
    symbol: /[^A-Za-z0-9]/.test(raw),
  };

  let points = Object.values(rules).filter(Boolean).length;
  if (raw.length >= 12) points += 1;
  // Penalise common patterns so "Password1!" doesn't read as strong.
  if (/(.)\1{2,}/.test(raw)) points -= 1;
  if (/^(password|admin|qwerty|letmein|welcome)/i.test(raw)) points -= 1;

  const clamped = Math.max(0, Math.min(points, 6));
  let tier: PasswordStrengthTier;
  if (clamped <= 1) tier = "weak";
  else if (clamped <= 3) tier = "fair";
  else if (clamped <= 4) tier = "good";
  else tier = "strong";

  return {
    tier,
    score: clamped / 6,
    label: LABELS[tier],
    rules,
  };
};
