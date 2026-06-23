import { getCurrencyConfig } from './currency';

export function formatCurrency(amount, currency = 'SEK') {
  const { locale } = getCurrencyConfig(currency);
  return new Intl.NumberFormat(locale).format(Math.round(amount));
}

export function formatMoney(amount, currency = 'SEK') {
  const { symbol } = getCurrencyConfig(currency);
  return `${formatCurrency(amount, currency)} ${symbol}`;
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}

export function formatPayoffDate(monthsFromNow, currency = 'SEK') {
  const { locale } = getCurrencyConfig(currency);
  const date = new Date();
  date.setMonth(date.getMonth() + monthsFromNow);
  return date.toLocaleDateString(locale, { year: 'numeric', month: 'long' });
}
