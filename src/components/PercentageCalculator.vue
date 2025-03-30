<template>
  <div class="percentage-calculator">
    <div class="calculator-header">
      <h3>Payment Calculator</h3>
      <div class="mode-toggle">
        <button 
          @click="calculatorMode = 'percentage'" 
          :class="{ active: calculatorMode === 'percentage' }"
          class="toggle-btn"
        >
          Percentage
        </button>
        <button 
          @click="calculatorMode = 'amount'" 
          :class="{ active: calculatorMode === 'amount' }"
          class="toggle-btn"
        >
          Amount
        </button>
      </div>
    </div>
    
    <div class="percentage-form">
      <div class="loan-info">
        <div class="loan-stat">
          <span class="stat-label">Loan to Value:</span>
          <span class="stat-value">{{ loanToValuePercentage.toFixed(1) }}%</span>
        </div>
      </div>
      
      <div class="form-group">
        <label v-if="calculatorMode === 'percentage'">% of Loan to Pay</label>
        <label v-else>Loan Amount to Pay</label>
        
        <!-- Percentage Mode -->
        <div v-if="calculatorMode === 'percentage'" class="slider-container">
          <input 
            type="range" 
            id="percentageAmount" 
            v-model.number="percentageAmount" 
            min="0" 
            max="100" 
            step="1"
          >
          <div class="input-with-unit">
            <input 
              type="number" 
              v-model.number="percentageAmount" 
              min="0" 
              max="100"
              class="percentage-text-input"
            >
            <span>%</span>
          </div>
        </div>
        
        <!-- Amount Mode -->
        <div v-else class="slider-container">
          <input 
            type="range" 
            id="loanAmountInput" 
            v-model.number="directLoanAmount" 
            :min="0" 
            :max="values.originalLoanAmount" 
            :step="10000"
          >
          <div class="input-with-unit">
            <input 
              type="number" 
              v-model.number="directLoanAmount" 
              :min="0" 
              :max="values.originalLoanAmount"
              class="amount-text-input"
            >
            <span>SEK</span>
          </div>
        </div>
        
        <div class="loan-amount-display">
          <template v-if="calculatorMode === 'percentage'">
            Loan amount: {{ formatCurrency(loanAmountToPayOff) }} SEK
          </template>
          <template v-else>
            Percentage: {{ calculatedPercentage.toFixed(1) }}% of original loan
          </template>
        </div>
      </div>
      
      <div class="results-grid" v-if="calculatedResults">
        <div class="result-card">
          <div class="result-title">Monthly Payment</div>
          <div class="result-value">{{ formatCurrency(totalMonthlyWithBrf) }} SEK</div>
          <div class="result-subtitle">
            <template v-if="effectiveLoanAmount > 0">
              Loan: {{ formatCurrency(calculatedResults.newMonthlyPayment) }}<br>
              Brf: {{ formatCurrency(values.brfFee) }}
            </template>
            <template v-else>
              Brf fee only
            </template>
          </div>
        </div>
        
        <div class="result-card">
          <div class="result-title">
            Time to Payoff
            <span class="tooltip-icon" @mouseover="showTooltip = true" @mouseleave="showTooltip = false">?
              <div class="tooltip-content" v-if="showTooltip">
                <p><strong>How this is calculated:</strong></p>
                <p>For loans with LTV > 50%, we use the mandatory amortization rate (1% or 2%).</p>
                <p>For loans with LTV ≤ 50%, there's no mandatory amortization in Sweden, but we calculate as if you continue to make payments that would pay off the loan within your original loan term.</p>
                <p>This calculation simulates month-by-month payments, reducing the principal each month until the loan reaches zero.</p>
              </div>
            </span>
          </div>
          <div class="result-value">{{ calculatedResults.timeToPayoff.years }}y {{ calculatedResults.timeToPayoff.months }}m</div>
          <div class="result-subtitle" v-if="calculatedResults.monthsSaved > 0">
            Save {{ Math.floor(calculatedResults.monthsSaved / 12) }}y {{ calculatedResults.monthsSaved % 12 }}m
          </div>
        </div>
        
        <div class="result-card">
          <div class="result-title">Amortization Rate</div>
          <div class="result-value">{{ calculatedResults.amortizationRate }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { calculateTimeToPayoff } from '../calculations/timeToPayoff';
import { formatCurrency } from '../utils/formatters';
import { AMORTIZATION_RULES } from '../utils/constants';

export default {
  name: 'PercentageCalculator',
  props: {
    values: {
      type: Object,
      required: true
    },
    results: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      percentageAmount: 100,
      directLoanAmount: 0,
      calculatorMode: 'percentage', // 'percentage' or 'amount'
      showTooltip: false
    };
  },
  created() {
    // Initialize the direct loan amount to the original loan amount
    this.directLoanAmount = this.values.originalLoanAmount;
  },
  watch: {
    'values.originalLoanAmount': {
      handler(newVal) {
        // Update direct loan amount when original loan amount changes
        if (this.calculatorMode === 'amount' && this.directLoanAmount === 0) {
          this.directLoanAmount = newVal;
        }
      },
      immediate: true
    },
    calculatorMode(newMode) {
      // When switching modes, sync the values
      if (newMode === 'amount') {
        this.directLoanAmount = this.loanAmountToPayOff;
      } else {
        this.percentageAmount = this.calculatedPercentage;
      }
    }
  },
  computed: {
    loanToValuePercentage() {
      return (this.values.currentLoanAmount / this.values.originalLoanAmount) * 100;
    },
    loanAmountToPayOff() {
      return (this.percentageAmount / 100) * this.values.originalLoanAmount;
    },
    calculatedPercentage() {
      return (this.directLoanAmount / this.values.originalLoanAmount) * 100;
    },
    effectiveLoanAmount() {
      return this.calculatorMode === 'percentage' 
        ? this.loanAmountToPayOff 
        : this.directLoanAmount;
    },
    basePayment() {
      return this.results ? this.results.totalMonthlyPayment : 0;
    },
    totalMonthlyWithBrf() {
      if (!this.calculatedResults) return 0;
      
      if (this.effectiveLoanAmount === 0) {
        return this.values.brfFee;
      }
      
      return this.calculatedResults.newMonthlyPayment + this.values.brfFee;
    },
    calculatedResults() {
      if (!this.results) return null;
      
      // If loan amount is 0, we're only paying the brf fee
      if (this.effectiveLoanAmount === 0) {
        return {
          newMonthlyPayment: 0,
          timeToPayoff: { years: 99, months: 0 },
          monthsSaved: 0,
          amortizationRate: 0
        };
      }
      
      // Get the effective loan amount based on mode
      const loanAmount = this.effectiveLoanAmount;
      
      // Calculate effective percentage for amortization rate
      const effectivePercentage = this.calculatorMode === 'percentage'
        ? this.percentageAmount
        : this.calculatedPercentage;
      
      // Calculate LTV based on the selected loan amount and property value
      const ltv = (loanAmount / this.values.propertyValue) * 100;
      
      // Determine amortization rate based on percentage of original loan
      let amortizationRate = 0;
      if (effectivePercentage > 70) {
        amortizationRate = 2; // 2% for percentages > 70%
      } else if (effectivePercentage > 50) {
        amortizationRate = 1; // 1% for 50% < percentages ≤ 70%
      }
      
      const interestRate = this.values.interestRate;
      const monthlyRate = interestRate / 100 / 12;
      
      // Calculate monthly amortization (ensure minimum amortization for payoff calculation)
      const mandatoryMonthlyAmortization = (loanAmount * amortizationRate / 100) / 12;
      
      // Calculate monthly interest
      const monthlyInterest = loanAmount * monthlyRate;
      
      // For payment calculation, use mandatory amortization
      const newMonthlyPayment = mandatoryMonthlyAmortization + monthlyInterest;
      
      // For time to payoff calculation, ensure there's always some principal repayment
      // Use standard mortgage formula if no mandatory amortization
      let payoffMonthlyPayment = newMonthlyPayment;
      if (amortizationRate === 0) {
        // Calculate payment based on the actual loan term from inputs
        const loanTermMonths = this.values.loanTermYears * 12;
        payoffMonthlyPayment = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths) / 
                              (Math.pow(1 + monthlyRate, loanTermMonths) - 1);
      }
      
      const timeToPayoff = calculateTimeToPayoff(
        loanAmount,
        payoffMonthlyPayment,
        interestRate
      );
      
      const standardMonths = this.values.loanTermYears * 12;
      const newMonths = timeToPayoff.years * 12 + timeToPayoff.months;
      const monthsSaved = standardMonths - newMonths;
      
      return {
        newMonthlyPayment,
        timeToPayoff,
        monthsSaved,
        amortizationRate
      };
    }
  },
  methods: {
    formatCurrency
  }
};
</script>

<style scoped>
.percentage-calculator {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.calculator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

h3 {
  margin: 0;
  font-size: 1.25rem;
}

.mode-toggle {
  display: flex;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
}

.toggle-btn {
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.toggle-btn.active {
  background: #0f172a;
  color: white;
  font-weight: 500;
}

.percentage-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.loan-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.loan-stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
}

.stat-value {
  font-weight: 600;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.loan-amount-display {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
}

label {
  font-weight: 500;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

input[type="range"] {
  flex: 1;
}

.input-with-unit {
  display: flex;
  align-items: center;
  min-width: 5rem;
}

.percentage-text-input {
  width: 3rem;
  padding: 0.25rem;
  text-align: right;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
}

.amount-text-input {
  width: 7rem;
  padding: 0.25rem;
  text-align: right;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
}

.input-with-unit span {
  margin-left: 0.25rem;
  font-weight: 600;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.result-card {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.result-title {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.result-value {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.result-subtitle {
  font-size: 0.75rem;
  color: #64748b;
}

.tooltip-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #64748b;
  color: white;
  font-size: 10px;
  margin-left: 4px;
  cursor: help;
  position: relative;
}

.tooltip-content {
  position: absolute;
  bottom: 24px;
  right: -12px;
  width: 300px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 10;
  font-size: 0.75rem;
  color: #334155;
  text-align: left;
}

.tooltip-content p {
  margin: 0.5rem 0;
}

.tooltip-content p:first-child {
  margin-top: 0;
}

.tooltip-content p:last-child {
  margin-bottom: 0;
}
</style>