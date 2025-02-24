import { createApp } from 'vue'; 
import MortgageCalculator from './MortgageCalculator.vue'

// Constants for Swedish mortgage rules
const AMORTIZATION_RULES = {
  HIGH_LTV: { threshold: 0.7, rate: 0.02 },
  MEDIUM_LTV: { threshold: 0.5, rate: 0.01 },
  LOW_LTV: { threshold: 0, rate: 0 }
};

// Calculate monthly mortgage payments
function calculateMortgage(
  loanAmount,
  propertyValue,
  annualIncome,
  interestRate,
  loanTermYears
) {
  // Calculate Loan-to-Value ratio
  const ltv = loanAmount / propertyValue;
  
  // Determine amortization rate based on LTV
  let amortizationRate = 0;
  if (ltv > AMORTIZATION_RULES.HIGH_LTV.threshold) {
    amortizationRate = AMORTIZATION_RULES.HIGH_LTV.rate;
  } else if (ltv > AMORTIZATION_RULES.MEDIUM_LTV.threshold) {
    amortizationRate = AMORTIZATION_RULES.MEDIUM_LTV.rate;
  }

  // Calculate monthly interest rate
  const monthlyInterestRate = interestRate / 12 / 100;
  
  // Calculate monthly payments
  const monthlyAmortization = (loanAmount * amortizationRate) / 12;
  const monthlyInterest = loanAmount * monthlyInterestRate;
  
  return {
    monthlyAmortization,
    monthlyInterest,
    totalMonthlyPayment: monthlyAmortization + monthlyInterest,
    effectiveInterestRate: interestRate,
    amortizationRate: amortizationRate * 100
  };
}

const app = createApp({
  components: {
    MortgageCalculator
  },
  template: `
    <div class="app">
      <h1>Swedish Mortgage Calculator</h1>
      <MortgageCalculator />
    </div>
  `
})

app.mount('#app')

