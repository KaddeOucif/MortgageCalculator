export const CURRENCIES = {
  SEK: { code: 'SEK', locale: 'sv-SE', symbol: 'SEK' },
  EUR: { code: 'EUR', locale: 'de-DE', symbol: 'EUR' },
  GBP: { code: 'GBP', locale: 'en-GB', symbol: 'GBP' },
};

export const EUR_SEK_RATE = 11.5; // 1 EUR = 11.5 SEK
export const GBP_SEK_RATE = 13.2; // 1 GBP = 13.2 SEK

const RATES_TO_SEK = {
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

function toSek(amount, currency) {
  if (currency === 'SEK') {
    return amount;
  }

  return amount * RATES_TO_SEK[currency];
}

function fromSek(amountSek, currency) {
  if (currency === 'SEK') {
    return amountSek;
  }

  return amountSek / RATES_TO_SEK[currency];
}

export function convertAmount(amount, from, to) {
  if (from === to) {
    return amount;
  }

  return fromSek(toSek(amount, from), to);
}

export function roundMonetaryAmount(amount) {
  return Math.round(amount);
}

export function convertValuesCurrency(values, from, to) {
  const converted = { ...values };

  for (const field of MONETARY_FIELDS) {
    if (converted[field] != null) {
      converted[field] = roundMonetaryAmount(convertAmount(converted[field], from, to));
    }
  }

  return converted;
}

export function getMonetaryInputStep(currency = 'SEK') {
  return currency === 'SEK' ? 100 : 10;
}

export function getLoanAmountStep(currency = 'SEK') {
  return currency === 'SEK' ? 10000 : 1000;
}
