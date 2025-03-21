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

  return scenarios.map(scenario => {
    const totalMonthly = baseMonthlyPayment + scenario.extra;
    const timeToPayoff = calculateTimeToPayoff(
      currentLoan, 
      totalMonthly, 
      interestRate
    );
    const totalInterest = (totalMonthly * (timeToPayoff.years * 12 + timeToPayoff.months)) - currentLoan;
    const monthsSaved = (30 * 12) - (timeToPayoff.years * 12 + timeToPayoff.months);
    
    return {
      ...scenario,
      monthlyPayment: totalMonthly,
      timeToPayoff,
      totalInterest,
      interestSaved: (currentLoan * interestRate / 100 * 30) - totalInterest,
      monthsSaved
    };
  });
}