// src/calculations/paymentScenarios.js
import { convertAmount, getCurrencyConfig } from '../utils/currency';
import { formatCurrency } from '../utils/formatters';

const MAX_PAYOFF_MONTHS = 99 * 12;

const PRESET_EXTRAS_SEK = [1000, 2000, 5000];

function getPresetExtra(amountSek, currency) {
  if (currency === 'SEK') {
    return amountSek;
  }

  return Math.round(convertAmount(amountSek, 'SEK', currency));
}

function formatExtraLabel(amount, currency) {
  const { symbol } = getCurrencyConfig(currency);
  return `+${formatCurrency(amount, currency)} ${symbol}/month`;
}

export function calculateCustomExtraPayment(currentLoan, baseMonthlyPayment, extraPayment, interestRate) {
  const monthlyRate = interestRate / 100 / 12;
  const standardPayoffMonths = calculateTimeToPayoffInMonths(currentLoan, baseMonthlyPayment, monthlyRate);

  if (extraPayment <= 0) {
    return {
      monthlyPayment: baseMonthlyPayment,
      timeToPayoff: monthsToTimeToPayoff(standardPayoffMonths),
      payoffMonths: standardPayoffMonths,
      monthsSaved: 0,
      interestSaved: 0,
      paymentTooLow: false
    };
  }

  const newMonthlyPayment = baseMonthlyPayment + extraPayment;
  const newPayoffMonths = calculateTimeToPayoffInMonths(currentLoan, newMonthlyPayment, monthlyRate);
  const paymentTooLow = newPayoffMonths >= MAX_PAYOFF_MONTHS;

  const standardTotalInterest = (baseMonthlyPayment * standardPayoffMonths) - currentLoan;
  const newTotalInterest = (newMonthlyPayment * newPayoffMonths) - currentLoan;
  const interestSaved = paymentTooLow ? 0 : standardTotalInterest - newTotalInterest;
  const monthsSaved = paymentTooLow ? 0 : standardPayoffMonths - newPayoffMonths;

  return {
    monthlyPayment: newMonthlyPayment,
    timeToPayoff: monthsToTimeToPayoff(newPayoffMonths),
    payoffMonths: newPayoffMonths,
    monthsSaved,
    interestSaved,
    paymentTooLow
  };
}

export function calculateExtraPaymentScenarios(currentLoan, baseMonthlyPayment, interestRate, currency = 'SEK') {
  const presetScenarios = PRESET_EXTRAS_SEK.map((amountSek, index) => {
    const colors = ['#4caf50', '#2196f3', '#9c27b0'];
    const extra = getPresetExtra(amountSek, currency);

    return {
      extra,
      label: formatExtraLabel(extra, currency),
      color: colors[index]
    };
  });

  const scenarios = [
    ...presetScenarios,
    { extra: baseMonthlyPayment * 0.5, label: '+50% payment', color: '#ff9800' },
    { extra: baseMonthlyPayment, label: 'Double payment', color: '#f44336' }
  ];

  return scenarios.map(scenario => {
    const result = calculateCustomExtraPayment(
      currentLoan,
      baseMonthlyPayment,
      scenario.extra,
      interestRate
    );

    return {
      ...scenario,
      monthlyPayment: result.monthlyPayment,
      timeToPayoff: result.timeToPayoff,
      monthsSaved: result.monthsSaved,
      interestSaved: result.interestSaved
    };
  });
}

function monthsToTimeToPayoff(months) {
  return {
    years: Math.floor(months / 12),
    months: months % 12
  };
}

function calculateTimeToPayoffInMonths(loanAmount, monthlyPayment, monthlyRate) {
  if (monthlyRate === 0) {
    return Math.ceil(loanAmount / monthlyPayment);
  }

  if (monthlyPayment <= loanAmount * monthlyRate) {
    return MAX_PAYOFF_MONTHS;
  }

  const numerator = Math.log(monthlyPayment / (monthlyPayment - loanAmount * monthlyRate));
  const denominator = Math.log(1 + monthlyRate);
  const months = Math.ceil(numerator / denominator);

  if (!Number.isFinite(months) || months < 0) {
    return MAX_PAYOFF_MONTHS;
  }

  return months;
}
