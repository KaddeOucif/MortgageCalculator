export const CURRENCIES = {
  SEK: { code: 'SEK', locale: 'sv-SE', symbol: 'SEK' },
  EUR: { code: 'EUR', locale: 'de-DE', symbol: 'EUR' },
  GBP: { code: 'GBP', locale: 'en-GB', symbol: 'GBP' },
};

export const EUR_SEK_RATE = 11.5; // 1 EUR = 11.5 SEK
export const GBP_SEK_RATE = 13.2; // 1 GBP = 13.2 SEK

const RATES_TO_SEK = {
  SEK: 1,
  EUR: EUR_SEK_RATE,
  GBP: GBP_SEK_RATE,
};

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

  const amountInSek = amount * RATES_TO_SEK[from];
  return amountInSek / RATES_TO_SEK[to];
}

export function roundMonetaryAmount(amount, currency = 'SEK') {
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
