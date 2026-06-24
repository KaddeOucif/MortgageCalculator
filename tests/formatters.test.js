import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from '../src/utils/formatters.js';
import { CURRENCIES } from '../src/utils/currency.js';

describe('formatters', () => {
  it('formats currency with Swedish locale grouping', () => {
    expect(formatCurrency(2000000)).toMatch(/2[\s\u00a0]?000[\s\u00a0]?000/);
    expect(formatCurrency(7500.4)).toBe('7\u00a0500');
  });

  it('formats EUR with German locale grouping', () => {
    expect(formatCurrency(173913, CURRENCIES.EUR)).toMatch(/173[\s\u00a0.]?913/);
  });

  it('formats dates as locale strings', () => {
    const formatted = formatDate('2024-06-15');
    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe('string');
  });
});
