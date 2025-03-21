<template>
  <div class="scenarios-tab">
    <PercentageCalculator 
      :values="values" 
      :results="results"
    />
    <div class="scenarios-grid" v-if="scenarios.length">
      <div 
        v-for="(scenario, index) in scenarios" 
        :key="index"
        class="scenario-card"
        :style="{ borderLeftColor: scenario.color }"
      >
        <div class="scenario-title">{{ scenario.label }}</div>
        <div class="scenario-detail">
          <span>Monthly Payment:</span>
          <span>{{ formatCurrency(scenario.monthlyPayment) }} SEK</span>
        </div>
        <div class="scenario-detail">
          <span>Time to Payoff:</span>
          <span>{{ scenario.timeToPayoff.years }}y {{ scenario.timeToPayoff.months }}m</span>
        </div>
        <div class="scenario-detail">
          <span>Interest Saved:</span>
          <span>{{ formatCurrency(scenario.interestSaved) }} SEK</span>
        </div>
        <div class="scenario-detail">
          <span>Time Saved:</span>
          <span>{{ Math.floor(scenario.monthsSaved / 12) }}y {{ scenario.monthsSaved % 12 }}m</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatCurrency } from '../utils/formatters';
import PercentageCalculator from './PercentageCalculator.vue';
import { calculateExtraPaymentScenarios } from '../calculations/paymentScenarios';

export default {
  name: 'PaymentScenarios',
  components: {
    PercentageCalculator
  },
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
  computed: {
    scenarios() {
      if (!this.results) return [];
      
      return calculateExtraPaymentScenarios(
        this.values.currentLoanAmount,
        this.results.totalMonthlyPayment,
        this.values.interestRate
      );
    }
  },
  methods: {
    formatCurrency
  }
};
</script>

<style scoped>
.scenarios-tab {
  padding: 1rem 0;
}

.scenarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.scenario-card {
  background: white;
  border-radius: 0.5rem;
  border-left: 4px solid #ddd;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.scenario-title {
  font-weight: 600;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.scenario-detail {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}
</style>
