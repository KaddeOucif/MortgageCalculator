<template>
  <div class="results" v-if="results">
    <h2>Monthly Payment Breakdown</h2>
    <div class="result-item">
      <span>Monthly Amortization:</span>
      <span>{{ formatCurrency(results.monthlyAmortization) }} SEK</span>
    </div>
    <div class="result-item">
      <span>Monthly Interest:</span>
      <span>{{ formatCurrency(results.monthlyInterest) }} SEK</span>
    </div>
    <div class="result-item">
      <span>Total Monthly Payment:</span>
      <span>{{ formatCurrency(results.totalMonthlyPayment) }} SEK</span>
    </div>
    <div class="result-item">
      <span>Total with Brf Fee:</span>
      <span>{{ formatCurrency(totalWithBrf) }} SEK</span>
    </div>
    <div class="result-item">
      <span>Required Amortization Rate:</span>
      <span>{{ results.amortizationRate.toFixed(1) }}%</span>
    </div>
    
    <button @click="saveCalculation" class="save-btn">
      Save Calculation
    </button>
  </div>
</template>

<script>
import { formatCurrency } from '../utils/formatters';

export default {
  name: 'ResultsDisplay',
  props: {
    results: {
      type: Object,
      required: true
    },
    values: {
      type: Object,
      required: true
    }
  },
  computed: {
    totalWithBrf() {
      return this.results.totalMonthlyPayment + this.values.brfFee;
    }
  },
  methods: {
    formatCurrency,
    saveCalculation() {
      this.$emit('save');
    }
  }
};
</script>

<style scoped>
.results {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.result-item {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
  padding: 5px 0;
}

.save-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 500;
  width: 100%;
}

.save-btn:hover {
  background: #1e293b;
}
</style>
