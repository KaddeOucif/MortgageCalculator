<template>
  <div class="results card" v-if="results">
    <h2 class="card-title">Monthly Payment</h2>

    <div class="payment-hero">
      <span class="hero-label">Total with Brf Fee</span>
      <span class="hero-value">{{ formatMoney(totalWithBrf, currency) }}</span>
      <span class="hero-sub">Mortgage {{ formatMoney(results.totalMonthlyPayment, currency) }} + Brf {{ formatMoney(values.brfFee, currency) }}</span>
    </div>

    <div class="result-list">
      <div class="result-item">
        <span class="result-label">Monthly Amortization</span>
        <span class="result-value">{{ formatMoney(results.monthlyAmortization, currency) }}</span>
      </div>
      <div class="result-item">
        <span class="result-label">Monthly Interest</span>
        <span class="result-value">{{ formatMoney(results.monthlyInterest, currency) }}</span>
      </div>
      <div class="result-item">
        <span class="result-label">Total Monthly Payment</span>
        <span class="result-value">{{ formatMoney(results.totalMonthlyPayment, currency) }}</span>
      </div>
      <div class="result-item accent">
        <span class="result-label">Required Amortization Rate</span>
        <span class="result-value">{{ results.amortizationRate.toFixed(1) }}%</span>
      </div>
    </div>

    <button @click="saveCalculation" class="save-btn btn-primary">
      Save Calculation
    </button>
  </div>
</template>

<script>
import { formatMoney } from '../utils/formatters';

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
    },
    currency: {
      type: String,
      default: 'SEK'
    }
  },
  computed: {
    totalWithBrf() {
      return this.results.totalMonthlyPayment + this.values.brfFee;
    }
  },
  methods: {
    formatMoney,
    saveCalculation() {
      this.$emit('save');
    }
  }
};
</script>

<style scoped>
.results {
  padding: 1.5rem;
  border-top: 4px solid transparent;
  border-image: linear-gradient(90deg, var(--color-accent), var(--color-primary), var(--color-rose)) 1;
}

.payment-hero {
  background: linear-gradient(135deg, var(--color-primary-soft) 0%, var(--color-accent-soft) 50%, var(--color-violet-soft) 100%);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: var(--radius-md);
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.25rem;
}

.hero-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-primary);
  margin-bottom: 0.375rem;
}

.hero-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-violet) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
}

.hero-sub {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}

.result-item:nth-child(1) {
  background: var(--color-sky-soft);
}

.result-item:nth-child(2) {
  background: var(--color-amber-soft);
}

.result-item:nth-child(3) {
  background: var(--color-accent-soft);
}

.result-item.accent {
  background: var(--color-violet-soft);
}

.result-item.accent .result-value {
  color: var(--color-violet);
  font-weight: 700;
}

.result-label {
  color: var(--color-text-muted);
}

.result-value {
  font-weight: 600;
  color: var(--color-text);
}

.save-btn {
  margin-top: 1.25rem;
  width: 100%;
}
</style>
