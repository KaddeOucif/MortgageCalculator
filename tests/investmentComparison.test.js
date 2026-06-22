import { describe, it, expect } from 'vitest';
import { calculateComparisonScenarios } from '../src/calculations/investmentComparison.js';
import { calculateExtraPaymentScenarios } from '../src/calculations/paymentScenarios.js';

describe('calculateComparisonScenarios', () => {
  const scenarios = calculateExtraPaymentScenarios(2_000_000, 7500, 3.5);

  it('returns mortgage and investment strategies for each scenario', () => {
    const comparisons = calculateComparisonScenarios(
      scenarios,
      2_000_000,
      3.5,
      7,
      'isk'
    );

    expect(comparisons).toHaveLength(scenarios.length);

    comparisons.forEach(comparison => {
      expect(comparison.mortgageStrategy.netWorth).toBe(2_000_000);
      expect(comparison.investmentStrategy.afterTaxValue).toBeGreaterThan(0);
      expect(['mortgage', 'investment', 'tie']).toContain(comparison.winner);
      expect(comparison.mortgagePercentage).toBeGreaterThan(0);
      expect(comparison.investmentPercentage).toBeGreaterThan(0);
    });
  });

  it('calculates ISK tax separately from account value', () => {
    const [first] = calculateComparisonScenarios(scenarios, 2_000_000, 3.5, 7, 'isk');

    expect(first.investmentStrategy.iskTaxPaid).toBeGreaterThan(0);
    expect(first.investmentStrategy.afterTaxValue).toBe(first.investmentStrategy.finalValue);
  });

  it('applies capital gains tax for standard accounts', () => {
    const [first] = calculateComparisonScenarios(scenarios, 2_000_000, 3.5, 7, 'standard');

    expect(first.investmentStrategy.taxAmount).toBeGreaterThan(0);
    expect(first.investmentStrategy.afterTaxValue).toBeLessThan(first.investmentStrategy.finalValue);
  });
});
