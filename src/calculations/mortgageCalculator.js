// src/calculations/mortgageCalculator.js
import { AMORTIZATION_RULES, DEBT_TO_INCOME_LIMIT, STRESS_TEST_RATE_INCREASE, MIN_INTEREST_RATE } from '../utils/constants';
import { calculateAmortizationSchedule } from './amortizationSchedule';

export function calculateMortgage(
  originalLoanAmount,
  currentLoanAmount,
  propertyValue,
  annualIncome,
  interestRate,
  loanTermYears
) {
  const ltv = currentLoanAmount / propertyValue;
  const debtToIncome = currentLoanAmount / annualIncome;
  
  // Determine base amortization rate
  let amortizationRate = 0;
  if (ltv > AMORTIZATION_RULES.HIGH_LTV.threshold) {
    amortizationRate = AMORTIZATION_RULES.HIGH_LTV.rate;
  } else if (ltv > AMORTIZATION_RULES.MEDIUM_LTV.threshold) {
    amortizationRate = AMORTIZATION_RULES.MEDIUM_LTV.rate;
  }
  
  // Additional amortization for high debt-to-income
  if (debtToIncome > DEBT_TO_INCOME_LIMIT) {
    amortizationRate += 0.01; // Additional 1% amortization
  }

  const monthlyInterestRate = interestRate / 12 / 100;
  const monthlyAmortization = (currentLoanAmount * amortizationRate) / 12;
  const monthlyInterest = currentLoanAmount * monthlyInterestRate;

  // Calculate stress test
  const stressTestRate = Math.max(interestRate + STRESS_TEST_RATE_INCREASE, MIN_INTEREST_RATE);
  const stressTestMonthlyPayment = (currentLoanAmount * (stressTestRate / 12 / 100)) + monthlyAmortization;

  // Calculate amortization schedule
  const schedule = calculateAmortizationSchedule(currentLoanAmount, interestRate, amortizationRate, loanTermYears);
  
  return {
    monthlyAmortization,
    monthlyInterest,
    totalMonthlyPayment: monthlyAmortization + monthlyInterest,
    effectiveInterestRate: interestRate,
    amortizationRate: amortizationRate * 100,
    debtToIncome: debtToIncome * 100,
    stressTestMonthlyPayment,
    schedule,
    isAffordable: stressTestMonthlyPayment < (annualIncome / 12) * 0.4, // 40% of monthly income
    loanPercentage: (currentLoanAmount / originalLoanAmount) * 100,
  };
}

function generateAmortizationSchedule(loanAmount, monthlyPayment, interestRate, loanTermYears) {
  // ... existing schedule generation code ...
}