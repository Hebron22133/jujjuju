export const TIERS = [4000, 5000, 10000, 20000, 50000, 100000];

export function getNextTier(balance: number) {
  return TIERS.find((tier) => balance < tier) ?? null;
}

export function tierName(level: number) {
  if (level <= 0) return "Basic";
  return `Tier ${level}`;
}
