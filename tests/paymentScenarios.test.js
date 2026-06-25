import { describe, it, expect } from 'vitest';
import { calculateExtraPaymentScenarios } from '../src/calculations/paymentScenarios.js';

describe('calculateExtraPaymentScenarios', () => {
  const currentLoan = 2_000_000;
  const baseMonthlyPayment = 7500;
  const interestRate = 3.5;

  it('returns five predefined extra-payment scenarios', () => {
    const scenarios = calculateExtraPaymentScenarios(currentLoan, baseMonthlyPayment, interestRate);

    expect(scenarios).toHaveLength(5);
    expect(scenarios.map(s => s.label)).toEqual([
      '+1\u00a0000 SEK/month',
      '+2\u00a0000 SEK/month',
      '+5\u00a0000 SEK/month',
      '+50% payment',
      'Double payment'
    ]);
  });

  it('returns EUR labels when currency is EUR', () => {
    const eurLoan = Math.round(currentLoan / 11.5);
    const eurBasePayment = Math.round(baseMonthlyPayment / 11.5);
    const scenarios = calculateExtraPaymentScenarios(eurLoan, eurBasePayment, interestRate, 'EUR');

    expect(scenarios[0].label).toBe('+87 EUR/month');
    expect(scenarios[1].label).toBe('+174 EUR/month');
    expect(scenarios[2].label).toBe('+435 EUR/month');
  });

  it('returns GBP labels when currency is GBP', () => {
    const gbpLoan = Math.round(currentLoan / 13.2);
    const gbpBasePayment = Math.round(baseMonthlyPayment / 13.2);
    const scenarios = calculateExtraPaymentScenarios(gbpLoan, gbpBasePayment, interestRate, 'GBP');

    expect(scenarios[0].label).toBe('+76 GBP/month');
    expect(scenarios[1].label).toBe('+152 GBP/month');
    expect(scenarios[2].label).toBe('+379 GBP/month');
  });

  it('reduces payoff time for fixed extra-payment increments', () => {
    const scenarios = calculateExtraPaymentScenarios(currentLoan, baseMonthlyPayment, interestRate);
    const fixedIncrements = scenarios.slice(0, 3);

    const payoffMonths = fixedIncrements.map(
      s => s.timeToPayoff.years * 12 + s.timeToPayoff.months
    );

    for (let i = 1; i < payoffMonths.length; i++) {
      expect(payoffMonths[i]).toBeLessThan(payoffMonths[i - 1]);
    }
  });

  it('pays off faster than baseline when doubling payment', () => {
    const scenarios = calculateExtraPaymentScenarios(currentLoan, baseMonthlyPayment, interestRate);
    const baselineMonths = scenarios[0].monthsSaved;
    const doublePayment = scenarios[4];

    expect(doublePayment.monthlyPayment).toBe(baseMonthlyPayment * 2);
    expect(doublePayment.monthsSaved).toBeGreaterThan(baselineMonths);
  });

  it('reports positive months and interest saved for extra payments', () => {
    const scenarios = calculateExtraPaymentScenarios(currentLoan, baseMonthlyPayment, interestRate);

    scenarios.forEach(scenario => {
      expect(scenario.monthsSaved).toBeGreaterThan(0);
      expect(scenario.interestSaved).toBeGreaterThan(0);
      expect(scenario.monthlyPayment).toBeGreaterThan(baseMonthlyPayment);
    });
  });
});
