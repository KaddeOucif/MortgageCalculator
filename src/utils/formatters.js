// src/utils/formatters.js
import { CURRENCIES } from './currency.js';

const LOCALE_BY_CURRENCY = {
  [CURRENCIES.SEK]: 'sv-SE',
  [CURRENCIES.EUR]: 'de-DE',
};

export function formatCurrency(amount, currency = CURRENCIES.SEK) {
  const locale = LOCALE_BY_CURRENCY[currency] || LOCALE_BY_CURRENCY[CURRENCIES.SEK];
  return new Intl.NumberFormat(locale).format(Math.round(amount));
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}
