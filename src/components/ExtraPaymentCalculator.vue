<template>
  <div class="extra-payment-calculator card">
    <h3 class="card-title">Custom Extra Payment</h3>
    <p class="section-description">
      Enter an extra amount to pay each month and see how much interest you save and when your loan would be paid off.
    </p>

    <div class="form-group">
      <label for="extraPayment">Extra Monthly Payment ({{ currency }})</label>
      <input
        id="extraPayment"
        type="number"
        v-model.number="extraPayment"
        min="0"
        :step="currency === 'SEK' ? 100 : 10"
      >
    </div>

    <div v-if="extraPayment <= 0" class="empty-state">
      Enter an amount above 0 to see your savings.
    </div>

    <div v-else-if="customResult?.paymentTooLow" class="warning-state">
      Payment is too low to cover interest. Increase the extra amount to see payoff savings.
    </div>

    <div v-else class="results-grid">
      <div class="result-card">
        <div class="result-title">New Monthly Payment</div>
        <div class="result-value">{{ formatMoney(customResult.monthlyPayment, currency) }}</div>
        <div class="result-subtitle">
          Base {{ formatMoney(results.totalMonthlyPayment, currency) }} + extra {{ formatMoney(extraPayment, currency) }}
        </div>
      </div>

      <div class="result-card highlight-success">
        <div class="result-title">Interest Saved</div>
        <div class="result-value">{{ formatMoney(customResult.interestSaved, currency) }}</div>
        <div class="result-subtitle">vs paying only the baseline monthly payment</div>
      </div>

      <div class="result-card">
        <div class="result-title">New Payoff Date</div>
        <div class="result-value">{{ payoffDate }}</div>
        <div class="result-subtitle">({{ formatTimeSaved(customResult.payoffMonths) }} from now)</div>
      </div>

      <div class="result-card">
        <div class="result-title">Time Saved</div>
        <div class="result-value">{{ formatTimeSaved(customResult.monthsSaved) }}</div>
        <div class="result-subtitle">
          Payoff in {{ customResult.timeToPayoff.years }}y {{ customResult.timeToPayoff.months }}m
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { calculateCustomExtraPayment } from '../calculations/paymentScenarios';
import { formatMoney, formatPayoffDate } from '../utils/formatters';

export default {
  name: 'ExtraPaymentCalculator',
  props: {
    values: {
      type: Object,
      required: true
    },
    results: {
      type: Object,
      required: true
    },
    currency: {
      type: String,
      default: 'SEK'
    }
  },
  data() {
    return {
      extraPayment: 0
    };
  },
  computed: {
    customResult() {
      if (!this.results) {
        return null;
      }

      return calculateCustomExtraPayment(
        this.values.currentLoanAmount,
        this.results.totalMonthlyPayment,
        this.extraPayment,
        this.values.interestRate
      );
    },
    payoffDate() {
      if (!this.customResult || this.extraPayment <= 0 || this.customResult.paymentTooLow) {
        return '';
      }

      return formatPayoffDate(this.customResult.payoffMonths, this.currency);
    }
  },
  methods: {
    formatMoney,
    formatTimeSaved(months) {
      const absoluteMonths = Math.abs(months);
      const years = Math.floor(absoluteMonths / 12);
      const remainingMonths = absoluteMonths % 12;

      return `${years}y ${remainingMonths}m`;
    }
  }
};
</script>

<style scoped>
.extra-payment-calculator {
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.extra-payment-calculator .card-title {
  margin-bottom: 0.5rem;
}

.section-description {
  margin: 0 0 1.25rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

label {
  font-weight: 500;
}

.empty-state,
.warning-state {
  padding: 0.875rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}

.empty-state {
  background: var(--color-surface-muted);
  color: var(--color-text-muted);
  border: 1px dashed var(--color-border);
}

.warning-state {
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fcd34d;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.result-card {
  background: var(--color-surface-muted);
  padding: 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.result-card.highlight-success {
  background: #ecfdf5;
  border-color: rgba(16, 185, 129, 0.35);
}

.result-card.highlight-success .result-value {
  color: var(--color-success);
}

.result-title {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: 0.25rem;
}

.result-value {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--color-text);
}

.result-subtitle {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  line-height: 1.4;
}
</style>
