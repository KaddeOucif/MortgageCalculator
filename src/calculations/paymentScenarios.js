// src/calculations/paymentScenarios.js
import { calculateTimeToPayoff } from './timeToPayoff';

export function calculateExtraPaymentScenarios(currentLoan, baseMonthlyPayment, interestRate) {
  const scenarios = [
    { extra: 1000, label: '+1,000 SEK/month', color: '#4caf50' },
    { extra: 2000, label: '+2,000 SEK/month', color: '#2196f3' },
    { extra: 5000, label: '+5,000 SEK/month', color: '#9c27b0' },
    { extra: baseMonthlyPayment * 0.5, label: '+50% payment', color: '#ff9800' },
    { extra: baseMonthlyPayment, label: 'Double payment', color: '#f44336' }
  ];

  // Calculate standard payoff time (baseline)
  const monthlyRate = interestRate / 100 / 12;
  const standardPayoffMonths = calculateTimeToPayoffInMonths(currentLoan, baseMonthlyPayment, monthlyRate);
  
  return scenarios.map(scenario => {
    const newMonthlyPayment = baseMonthlyPayment + scenario.extra;
    
    // Calculate new payoff time with extra payment
    const newPayoffMonths = calculateTimeToPayoffInMonths(currentLoan, newMonthlyPayment, monthlyRate);
    
    // Calculate months saved (should always be positive)
    const monthsSaved = standardPayoffMonths - newPayoffMonths;
    
    // Calculate interest saved
    const standardTotalInterest = (baseMonthlyPayment * standardPayoffMonths) - currentLoan;
    const newTotalInterest = (newMonthlyPayment * newPayoffMonths) - currentLoan;
    const interestSaved = standardTotalInterest - newTotalInterest;
    
    return {
      ...scenario,
      monthlyPayment: newMonthlyPayment,
      timeToPayoff: {
        years: Math.floor(newPayoffMonths / 12),
        months: newPayoffMonths % 12
      },
      monthsSaved: monthsSaved,
      interestSaved: interestSaved
    };
  });
}

// Helper function to calculate time to payoff in months
function calculateTimeToPayoffInMonths(loanAmount, monthlyPayment, monthlyRate) {
  // If no interest, simple division
  if (monthlyRate === 0) {
    return Math.ceil(loanAmount / monthlyPayment);
  }
  
  // Standard formula for time to payoff with interest
  // ln(monthlyPayment / (monthlyPayment - loanAmount * monthlyRate)) / ln(1 + monthlyRate)
  const numerator = Math.log(monthlyPayment / (monthlyPayment - loanAmount * monthlyRate));
  const denominator = Math.log(1 + monthlyRate);
  
  return Math.ceil(numerator / denominator);
}