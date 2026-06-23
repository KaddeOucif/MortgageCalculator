export const CURRENCIES = {
  SEK: { code: 'SEK', locale: 'sv-SE', symbol: 'SEK' },
  EUR: { code: 'EUR', locale: 'de-DE', symbol: 'EUR' },
};

export const EUR_SEK_RATE = 11.5; // 1 EUR = 11.5 SEK

const MONETARY_FIELDS = [
  'originalLoanAmount',
  'currentLoanAmount',
  'propertyValue',
  'annualIncome',
  'brfFee',
];

export function getCurrencyConfig(currency = 'SEK') {
  return CURRENCIES[currency] || CURRENCIES.SEK;
}

export function convertAmount(amount, from, to) {
  if (from === to) {
    return amount;
  }

  if (from === 'SEK' && to === 'EUR') {
    return amount / EUR_SEK_RATE;
  }

  if (from === 'EUR' && to === 'SEK') {
    return amount * EUR_SEK_RATE;
  }

  return amount;
}

export function roundMonetaryAmount(amount, currency = 'SEK') {
  if (currency === 'EUR') {
    return Math.round(amount);
  }

  return Math.round(amount);
}

export function convertValuesCurrency(values, from, to) {
  const converted = { ...values };

  for (const field of MONETARY_FIELDS) {
    if (converted[field] != null) {
      converted[field] = roundMonetaryAmount(convertAmount(converted[field], from, to), to);
    }
  }

  return converted;
}
