export const CURRENCIES = { SEK: 'SEK', EUR: 'EUR' };
export const EUR_SEK_RATE = 11.5;

export function toDisplayAmount(sekAmount, currency) {
  if (currency === CURRENCIES.EUR) {
    return Math.round(sekAmount / EUR_SEK_RATE);
  }
  return Math.round(sekAmount);
}

export function fromDisplayAmount(displayAmount, currency) {
  if (currency === CURRENCIES.EUR) {
    return Math.round(displayAmount * EUR_SEK_RATE);
  }
  return Math.round(displayAmount);
}

export function currencySymbol(currency) {
  return currency;
}
