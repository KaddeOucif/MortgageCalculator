<template>
  <div class="mortgage-calculator">
    <div class="input-section">
      <div class="form-group">
        <label>Loan Amount (SEK)</label>
        <input 
          type="number" 
          v-model.number="loanAmount" 
          placeholder="e.g. 2000000"
        >
      </div>
      
      <div class="form-group">
        <label>Property Value (SEK)</label>
        <input 
          type="number" 
          v-model.number="propertyValue" 
          placeholder="e.g. 3000000"
        >
      </div>
      
      <div class="form-group">
        <label>Annual Income (SEK)</label>
        <input 
          type="number" 
          v-model.number="annualIncome" 
          placeholder="e.g. 500000"
        >
      </div>
      
      <div class="form-group">
        <label>Interest Rate (%)</label>
        <input 
          type="number" 
          v-model.number="interestRate" 
          step="0.1" 
          placeholder="e.g. 3.5"
        >
      </div>
      
      <div class="form-group">
        <label>Loan Term (Years)</label>
        <input 
          type="number" 
          v-model.number="loanTermYears" 
          placeholder="e.g. 30"
        >
      </div>
    </div>

    <div class="results-section" v-if="hasValidInput">
      <h3>Monthly Payment Breakdown</h3>
      <div class="result-item">
        <span>Amortization:</span>
        <span>{{ formatCurrency(results.monthlyAmortization) }} SEK</span>
      </div>
      <div class="result-item">
        <span>Interest:</span>
        <span>{{ formatCurrency(results.monthlyInterest) }} SEK</span>
      </div>
      <div class="result-item total">
        <span>Total Monthly Payment:</span>
        <span>{{ formatCurrency(results.totalMonthlyPayment) }} SEK</span>
      </div>
      <div class="result-item">
        <span>Required Amortization Rate:</span>
        <span>{{ results.amortizationRate }}%</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { calculateMortgage } from './main.js'

export default {
  name: 'MortgageCalculator',
  setup() {
    const loanAmount = ref(null)
    const propertyValue = ref(null)
    const annualIncome = ref(null)
    const interestRate = ref(null)
    const loanTermYears = ref(30)

    const hasValidInput = computed(() => {
      return loanAmount.value && 
             propertyValue.value && 
             annualIncome.value && 
             interestRate.value && 
             loanTermYears.value
    })

    const results = computed(() => {
      if (!hasValidInput.value) return null
      
      return calculateMortgage(
        loanAmount.value,
        propertyValue.value,
        annualIncome.value,
        interestRate.value,
        loanTermYears.value
      )
    })

    const formatCurrency = (value) => {
      return Math.round(value).toLocaleString('sv-SE')
    }

    return {
      loanAmount,
      propertyValue,
      annualIncome,
      interestRate,
      loanTermYears,
      results,
      hasValidInput,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.mortgage-calculator {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.input-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 8px;
  font-weight: 600;
}

input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.results-section {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
  padding: 5px 0;
}

.total {
  border-top: 2px solid #ddd;
  margin-top: 15px;
  padding-top: 15px;
  font-weight: bold;
}

@media (max-width: 600px) {
  .input-section {
    grid-template-columns: 1fr;
  }
}
</style> 