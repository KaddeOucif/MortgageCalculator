import { describe, it, expect } from 'vitest';
import {
  convertAmount,
  convertValuesCurrency,
  EUR_SEK_RATE,
  GBP_SEK_RATE,
  getCurrencyConfig,
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
    expect(convertAmount(13500, 'SEK', 'GBP')).toBeCloseTo(1000, 5);
    expect(convertAmount(2000000, 'SEK', 'GBP')).toBeCloseTo(2000000 / GBP_SEK_RATE, 5);
  });

  it('converts GBP to SEK using fixed rate', () => {
    expect(convertAmount(1000, 'GBP', 'SEK')).toBe(13500);
  });

  it('converts between EUR and GBP via SEK', () => {
    const amount = 1000;
    const inGbp = convertAmount(amount, 'EUR', 'GBP');
    const backToEur = convertAmount(inGbp, 'GBP', 'EUR');
    expect(backToEur).toBeCloseTo(amount, 5);
  });

  it('round-trips amounts between currencies', () => {
    const original = 2_000_000;
    const inGbp = convertAmount(original, 'SEK', 'GBP');
    const backToSek = convertAmount(inGbp, 'GBP', 'SEK');
    expect(backToSek).toBeCloseTo(original, 5);
  });

  it('returns same amount when currencies match', () => {
    expect(convertAmount(7500, 'SEK', 'SEK')).toBe(7500);
  });

  it('converts all monetary value fields to GBP', () => {
    const values = {
      originalLoanAmount: 2000000,
      currentLoanAmount: 2000000,
      propertyValue: 3000000,
      annualIncome: 500000,
      interestRate: 3.5,
      loanTermYears: 30,
      brfFee: 3500,
    };

    const converted = convertValuesCurrency(values, 'SEK', 'GBP');

    expect(converted.originalLoanAmount).toBe(Math.round(2000000 / GBP_SEK_RATE));
    expect(converted.currentLoanAmount).toBe(Math.round(2000000 / GBP_SEK_RATE));
    expect(converted.propertyValue).toBe(Math.round(3000000 / GBP_SEK_RATE));
    expect(converted.annualIncome).toBe(Math.round(500000 / GBP_SEK_RATE));
    expect(converted.brfFee).toBe(Math.round(3500 / GBP_SEK_RATE));
    expect(converted.interestRate).toBe(3.5);
    expect(converted.loanTermYears).toBe(30);
  });

  it('converts all monetary value fields to EUR', () => {
    const values = {
      originalLoanAmount: 2000000,
      currentLoanAmount: 2000000,
      propertyValue: 3000000,
      annualIncome: 500000,
      interestRate: 3.5,
      loanTermYears: 30,
      brfFee: 3500,
    };

    const converted = convertValuesCurrency(values, 'SEK', 'EUR');

    expect(converted.originalLoanAmount).toBe(Math.round(2000000 / EUR_SEK_RATE));
    expect(converted.currentLoanAmount).toBe(Math.round(2000000 / EUR_SEK_RATE));
    expect(converted.propertyValue).toBe(Math.round(3000000 / EUR_SEK_RATE));
    expect(converted.annualIncome).toBe(Math.round(500000 / EUR_SEK_RATE));
    expect(converted.brfFee).toBe(Math.round(3500 / EUR_SEK_RATE));
    expect(converted.interestRate).toBe(3.5);
    expect(converted.loanTermYears).toBe(30);
  });
});
