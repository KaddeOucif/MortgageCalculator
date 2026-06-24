import { describe, it, expect } from 'vitest';
import {
  CURRENCIES,
  EUR_SEK_RATE,
  toDisplayAmount,
  fromDisplayAmount,
  currencySymbol,
} from '../src/utils/currency.js';

describe('currency', () => {
  it('converts SEK to EUR for display', () => {
    expect(toDisplayAmount(2300000, CURRENCIES.EUR)).toBe(Math.round(2300000 / EUR_SEK_RATE));
    expect(toDisplayAmount(2300000, CURRENCIES.SEK)).toBe(2300000);
  });

  it('converts EUR display amounts back to SEK', () => {
    const eurAmount = 200000;
    const sekAmount = fromDisplayAmount(eurAmount, CURRENCIES.EUR);
    expect(sekAmount).toBe(Math.round(eurAmount * EUR_SEK_RATE));
  });

  it('round-trips SEK amounts unchanged', () => {
    const original = 2000000;
    expect(fromDisplayAmount(toDisplayAmount(original, CURRENCIES.SEK), CURRENCIES.SEK)).toBe(original);
  });

  it('round-trips EUR display amounts approximately', () => {
    const original = 2000000;
    const display = toDisplayAmount(original, CURRENCIES.EUR);
    const back = fromDisplayAmount(display, CURRENCIES.EUR);
    expect(back).toBeCloseTo(original, -2);
  });

  it('returns currency symbol', () => {
    expect(currencySymbol(CURRENCIES.SEK)).toBe('SEK');
    expect(currencySymbol(CURRENCIES.EUR)).toBe('EUR');
  });
});
