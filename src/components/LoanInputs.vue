<template>
  <div class="loan-inputs card">
    <div class="card-header">
      <h2 class="card-title">Loan Details</h2>
      <CurrencyToggle :model-value="currency" @update:model-value="$emit('update:currency', $event)" />
    </div>

    <p v-if="currency === CURRENCIES.EUR" class="currency-note">
      Amounts shown in EUR (stored in SEK at 1 EUR = {{ EUR_SEK_RATE }} SEK)
    </p>

    <div class="input-section">
      <h3 class="section-header">Loan amounts</h3>
      <div class="input-grid">
        <MoneyInput
          :model-value="localValues.originalLoanAmount"
          label="Original Loan Amount"
          :min="0"
          :max="10000000"
          :step="50000"
          :currency="currency"
          hint="Initial loan amount when you took the mortgage"
          @update:model-value="updateField('originalLoanAmount', $event, true)"
        />
        <MoneyInput
          :model-value="localValues.currentLoanAmount"
          label="Current Loan Amount"
          :min="0"
          :max="localValues.originalLoanAmount"
          :step="50000"
          :currency="currency"
          hint="Your current remaining loan"
          @update:model-value="updateField('currentLoanAmount', $event, true)"
        />
      </div>
    </div>

    <div class="input-section">
      <h3 class="section-header">Property &amp; income</h3>
      <div class="input-grid">
        <MoneyInput
          :model-value="localValues.propertyValue"
          label="Property Value"
          :min="0"
          :max="20000000"
          :step="50000"
          :currency="currency"
          @update:model-value="updateField('propertyValue', $event)"
        />
        <MoneyInput
          :model-value="localValues.annualIncome"
          label="Annual Income"
          :min="0"
          :max="5000000"
          :step="10000"
          :currency="currency"
          @update:model-value="updateField('annualIncome', $event)"
        />
      </div>
    </div>

    <div class="input-section">
      <h3 class="section-header">Terms &amp; fees</h3>
      <div class="input-grid">
        <SliderInput
          :model-value="localValues.interestRate"
          label="Interest Rate"
          :min="0.1"
          :max="15"
          :step="0.01"
          unit="%"
          @update:model-value="updateField('interestRate', $event)"
        />
        <SliderInput
          :model-value="localValues.loanTermYears"
          label="Loan Term"
          :min="1"
          :max="40"
          :step="1"
          unit="years"
          @update:model-value="updateField('loanTermYears', $event)"
        />
        <MoneyInput
          :model-value="localValues.brfFee"
          label="Brf Fee"
          :min="0"
          :max="20000"
          :step="100"
          :currency="currency"
          hint="Monthly housing association fee"
          @update:model-value="updateField('brfFee', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import CurrencyToggle from './CurrencyToggle.vue';
import MoneyInput from './MoneyInput.vue';
import SliderInput from './SliderInput.vue';
import { CURRENCIES, EUR_SEK_RATE } from '../utils/currency.js';

export default {
  name: 'LoanInputs',
  components: {
    CurrencyToggle,
    MoneyInput,
    SliderInput,
  },
  props: {
    values: {
      type: Object,
      required: true,
    },
    currency: {
      type: String,
      default: CURRENCIES.SEK,
    },
  },
  emits: ['update', 'update:currency'],
  data() {
    return {
      localValues: { ...this.values },
      CURRENCIES,
      EUR_SEK_RATE,
    };
  },
  watch: {
    values: {
      handler(newValues) {
        this.localValues = { ...newValues };
      },
      deep: true,
    },
  },
  methods: {
    updateField(field, value, validateLoan = false) {
      this.localValues[field] = value;

      if (validateLoan && this.localValues.currentLoanAmount > this.localValues.originalLoanAmount) {
        this.localValues.currentLoanAmount = this.localValues.originalLoanAmount;
      }

      this.emitUpdate();
    },
    emitUpdate() {
      this.$emit('update', { ...this.localValues });
    },
  },
};
</script>

<style scoped>
.loan-inputs {
  padding: 1.5rem;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.25rem;
}

.card-header .card-title {
  margin-bottom: 0;
}
</style>
