<template>
  <div class="results card" v-if="results">
    <h2 class="card-title">Monthly Payment</h2>

    <div class="payment-hero">
      <span class="hero-label">Total with Brf Fee</span>
      <span class="hero-value">
        {{ formatCurrency(displayTotalWithBrf) }}
        <small>{{ currency }}</small>
      </span>
      <span class="hero-sub">
        Mortgage {{ formatCurrency(displayMonthlyPayment) }} + Brf {{ formatCurrency(displayBrfFee) }}
      </span>
    </div>

    <div class="stat-grid">
      <div class="stat-card stat-card--success">
        <span class="stat-card-label">Monthly Amortization</span>
        <span class="stat-card-value">
          {{ formatCurrency(displayAmortization) }}
          <small>{{ currency }}</small>
        </span>
      </div>
      <div class="stat-card stat-card--warning">
        <span class="stat-card-label">Monthly Interest</span>
        <span class="stat-card-value">
          {{ formatCurrency(displayInterest) }}
          <small>{{ currency }}</small>
        </span>
      </div>
      <div class="stat-card stat-card--primary">
        <span class="stat-card-label">Total Monthly Payment</span>
        <span class="stat-card-value">
          {{ formatCurrency(displayMonthlyPayment) }}
          <small>{{ currency }}</small>
        </span>
      </div>
    </div>

    <div class="result-item accent">
      <span class="result-label">Required Amortization Rate</span>
      <span class="result-value">{{ results.amortizationRate.toFixed(1) }}%</span>
    </div>

    <button @click="saveCalculation" class="save-btn btn-primary">
      Save Calculation
    </button>
  </div>
</template>

<script>
import { formatCurrency } from '../utils/formatters';
import { toDisplayAmount, CURRENCIES } from '../utils/currency.js';

export default {
  name: 'ResultsDisplay',
  props: {
    results: {
      type: Object,
      required: true,
    },
    values: {
      type: Object,
      required: true,
    },
    currency: {
      type: String,
      default: CURRENCIES.SEK,
    },
  },
  computed: {
    displayMonthlyPayment() {
      return toDisplayAmount(this.results.totalMonthlyPayment, this.currency);
    },
    displayAmortization() {
      return toDisplayAmount(this.results.monthlyAmortization, this.currency);
    },
    displayInterest() {
      return toDisplayAmount(this.results.monthlyInterest, this.currency);
    },
    displayBrfFee() {
      return toDisplayAmount(this.values.brfFee, this.currency);
    },
    displayTotalWithBrf() {
      return this.displayMonthlyPayment + this.displayBrfFee;
    },
  },
  methods: {
    formatCurrency(amount) {
      return formatCurrency(amount, this.currency);
    },
    saveCalculation() {
      this.$emit('save');
    },
  },
};
</script>

<style scoped>
.results {
  padding: 1.5rem;
}

.payment-hero {
  background: linear-gradient(135deg, #312e81 0%, #4f46e5 45%, #6366f1 100%);
  border: none;
  border-radius: var(--radius-md);
  padding: 1.5rem;
  margin-bottom: 1.25rem;
  position: relative;
  overflow: hidden;
}

.payment-hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.hero-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 0.375rem;
  position: relative;
}

.hero-value {
  display: block;
  font-size: 2.25rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: white;
  line-height: 1.1;
  position: relative;
}

.hero-value small {
  font-size: 1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

.hero-sub {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.65);
  position: relative;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1rem;
  background: var(--color-surface-muted);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  margin-bottom: 1.25rem;
}

.result-item.accent .result-value {
  color: var(--color-primary);
  font-weight: 600;
}

.result-label {
  color: var(--color-text-muted);
}

.result-value {
  font-weight: 600;
  color: var(--color-text);
}

.save-btn {
  width: 100%;
}
</style>
