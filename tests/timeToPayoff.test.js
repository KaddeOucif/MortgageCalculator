import { describe, it, expect } from 'vitest';
import { calculateTimeToPayoff } from '../src/calculations/timeToPayoff.js';

describe('calculateTimeToPayoff', () => {
  it('pays off a zero-interest loan by simple division', () => {
    const result = calculateTimeToPayoff(120_000, 1000, 0);

    expect(result.years).toBe(10);
    expect(result.months).toBe(0);
    expect(result.finalBalance).toBe(0);
  });

  it('returns extended payoff when payment only covers interest', () => {
    const result = calculateTimeToPayoff(1_000_000, 2916.67, 3.5);

    expect(result.years).toBeGreaterThanOrEqual(99);
    expect(result.finalBalance).toBeGreaterThan(0);
  });

  it('shortens payoff with a one-time extra payment', () => {
    const baseline = calculateTimeToPayoff(2_000_000, 7500, 3.5);
    const withExtra = calculateTimeToPayoff(2_000_000, 7500, 3.5, 200_000);

    const baselineMonths = baseline.years * 12 + baseline.months;
    const extraMonths = withExtra.years * 12 + withExtra.months;

    expect(extraMonths).toBeLessThan(baselineMonths);
    expect(withExtra.finalBalance).toBe(0);
  });
});
