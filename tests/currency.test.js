import { describe, it, expect } from 'vitest';
import {
  convertAmount,
  convertValuesCurrency,
  EUR_SEK_RATE,
  GBP_SEK_RATE,
  getCurrencyConfig,
  getLoanAmountStep,
  getMonetaryInputStep,
} from '../src/utils/currency.js';

describe('currency utilities', () => {
  it('returns currency config with fallback to SEK', () => {
    expect(getCurrencyConfig('EUR').code).toBe('EUR');
    expect(getCurrencyConfig('GBP').code).toBe('GBP');
    expect(getCurrencyConfig('UNKNOWN').code).toBe('SEK');
  });

  it('converts SEK to EUR using fixed rate', () => {
    expect(convertAmount(11500, 'SEK', 'EUR')).toBeCloseTo(1000, 5);
    expect(convertAmount(2000000, 'SEK', 'EUR')).toBeCloseTo(2000000 / EUR_SEK_RATE, 5);
  });

  it('converts EUR to SEK using fixed rate', () => {
    expect(convertAmount(1000, 'EUR', 'SEK')).toBe(11500);
  });

  it('converts SEK to GBP using fixed rate', () => {
    expect(convertAmount(13200, 'SEK', 'GBP')).toBeCloseTo(1000, 5);
    expect(convertAmount(2000000, 'SEK', 'GBP')).toBeCloseTo(2000000 / GBP_SEK_RATE, 5);
  });

  it('converts GBP to SEK using fixed rate', () => {
    expect(convertAmount(1000, 'GBP', 'SEK')).toBe(13200);
  });

  it('converts between EUR and GBP via SEK', () => {
    const amountEur = 1000;
    const amountGbp = convertAmount(amountEur, 'EUR', 'GBP');
    const backToEur = convertAmount(amountGbp, 'GBP', 'EUR');
    expect(backToEur).toBeCloseTo(amountEur, 5);
  });

  it('round-trips amounts between currencies', () => {
    const original = 2_000_000;
    const inEur = convertAmount(original, 'SEK', 'EUR');
    const backToSek = convertAmount(inEur, 'EUR', 'SEK');
    expect(backToSek).toBeCloseTo(original, 5);
  });

  it('returns same amount when currencies match', () => {
    expect(convertAmount(7500, 'SEK', 'SEK')).toBe(7500);
  });

  it('converts all monetary value fields', () => {
    const values = {
      originalLoanAmount: 2000000,
      currentLoanAmount: 2000000,
      propertyValue: 3000000,
      annualIncome: 500000,
      interestRate: 3.5,
      loanTermYears: 30,
      brfFee: 3500,
    };

    const convertedToEur = convertValuesCurrency(values, 'SEK', 'EUR');
    expect(convertedToEur.originalLoanAmount).toBe(Math.round(2000000 / EUR_SEK_RATE));
    expect(convertedToEur.interestRate).toBe(3.5);

    const convertedToGbp = convertValuesCurrency(values, 'SEK', 'GBP');
    expect(convertedToGbp.originalLoanAmount).toBe(Math.round(2000000 / GBP_SEK_RATE));
    expect(convertedToGbp.brfFee).toBe(Math.round(3500 / GBP_SEK_RATE));
    expect(convertedToGbp.interestRate).toBe(3.5);
    expect(convertedToGbp.loanTermYears).toBe(30);
  });

  it('returns input steps based on currency scale', () => {
    expect(getMonetaryInputStep('SEK')).toBe(100);
    expect(getMonetaryInputStep('EUR')).toBe(10);
    expect(getMonetaryInputStep('GBP')).toBe(10);
    expect(getLoanAmountStep('SEK')).toBe(10000);
    expect(getLoanAmountStep('GBP')).toBe(1000);
  });
});
