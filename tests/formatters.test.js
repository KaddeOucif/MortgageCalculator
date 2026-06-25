import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatMoney } from '../src/utils/formatters.js';

describe('formatters', () => {
  it('formats currency with Swedish locale grouping', () => {
    expect(formatCurrency(2000000)).toMatch(/2[\s\u00a0]?000[\s\u00a0]?000/);
    expect(formatCurrency(7500.4)).toBe('7\u00a0500');
  });

  it('formats EUR currency with German locale grouping', () => {
    expect(formatCurrency(100000, 'EUR')).toMatch(/100[\s\u00a0.]?000/);
    expect(formatCurrency(7500.4, 'EUR')).toBe('7.500');
  });

  it('formats GBP currency with UK locale grouping', () => {
    expect(formatCurrency(100000, 'GBP')).toMatch(/100,000/);
    expect(formatCurrency(7500.4, 'GBP')).toBe('7,500');
  });

  it('formats money with currency code suffix', () => {
    expect(formatMoney(7500, 'SEK')).toBe('7\u00a0500 SEK');
    expect(formatMoney(7500, 'EUR')).toBe('7.500 EUR');
    expect(formatMoney(7500, 'GBP')).toBe('7,500 GBP');
  });

  it('formats dates as locale strings', () => {
    const formatted = formatDate('2024-06-15');
    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe('string');
  });
});
