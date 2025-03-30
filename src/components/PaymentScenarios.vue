<template>
  <div class="scenarios-tab">
    <PercentageCalculator 
      :values="values" 
      :results="results"
    />
    
    <div class="view-toggle">
      <button 
        :class="{ active: activeView === 'scenarios' }" 
        @click="activeView = 'scenarios'"
      >
        Payment Scenarios
      </button>
      <button 
        :class="{ active: activeView === 'investment' }" 
        @click="activeView = 'investment'"
      >
        Investment Comparison
      </button>
    </div>
    
    <div v-if="activeView === 'scenarios'" class="scenarios-grid">
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
        <div class="scenario-detail time-saved-section">
          <div class="time-saved-header" @click="toggleExplanation(index)">
            <div class="time-saved-label">
              <span>Time Saved:</span>
              <span>{{ formatTimeSaved(scenario.monthsSaved) }}</span>
            </div>
            <div class="dropdown-button" :class="{ 'open': openExplanations[index] }">
              <span class="dropdown-text">{{ openExplanations[index] ? 'Hide details' : 'Show details' }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
          
          <div class="time-saved-explanation" v-if="openExplanations[index]">
            <div class="explanation-content">
              <p class="advisor-intro">Here's how you'll save {{ formatTimeSaved(scenario.monthsSaved) }}:</p>
              
              <div class="explanation-item">
                <span class="item-label">Standard loan term:</span>
                <span class="item-value">{{ values.loanTermYears }} years</span>
              </div>
              
              <div class="explanation-item">
                <span class="item-label">Standard monthly payment:</span>
                <span class="item-value">{{ formatCurrency(results.totalMonthlyPayment) }} SEK</span>
              </div>
              
              <div class="explanation-item highlight">
                <span class="item-label">Your new monthly payment:</span>
                <span class="item-value">{{ formatCurrency(scenario.monthlyPayment) }} SEK</span>
              </div>
              
              <div class="explanation-item highlight">
                <span class="item-label">Extra payment per month:</span>
                <span class="item-value">{{ formatCurrency(scenario.monthlyPayment - results.totalMonthlyPayment) }} SEK</span>
              </div>
              
              <div class="explanation-item">
                <span class="item-label">New payoff time:</span>
                <span class="item-value">{{ scenario.timeToPayoff.years }}y {{ scenario.timeToPayoff.months }}m</span>
              </div>
              
              <p class="advisor-tip">
                <strong>Financial Advisor Tip:</strong> By paying an extra {{ formatCurrency(scenario.monthlyPayment - results.totalMonthlyPayment) }} SEK per month, you'll not only save {{ formatTimeSaved(scenario.monthsSaved) }} on your mortgage but also save approximately {{ formatCurrency(scenario.interestSaved) }} SEK in interest payments over the life of the loan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <InvestmentComparison
      v-if="activeView === 'investment'"
      :values="values"
      :results="results"
      :scenarios="scenarios"
    />
  </div>
</template>

<script>
import { formatCurrency } from '../utils/formatters';
import PercentageCalculator from './PercentageCalculator.vue';
import InvestmentComparison from './InvestmentComparison.vue';
import { calculateExtraPaymentScenarios } from '../calculations/paymentScenarios';
import { ref, reactive } from 'vue'; // Import Vue 3 reactivity APIs

export default {
  name: 'PaymentScenarios',
  components: {
    PercentageCalculator,
    InvestmentComparison
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
  data() {
    return {
      openExplanations: {},
      activeView: 'scenarios' // Default view
    };
  },
  mounted() {
    // Initialize all explanations as closed
    if (this.scenarios && this.scenarios.length) {
      const explanations = {};
      this.scenarios.forEach((_, index) => {
        explanations[index] = false;
      });
      this.openExplanations = explanations;
    }
  },
  methods: {
    formatCurrency,
    formatTimeSaved(months) {
      // Ensure we're working with a positive number
      const absoluteMonths = Math.abs(months);
      const years = Math.floor(absoluteMonths / 12);
      const remainingMonths = absoluteMonths % 12;
      
      return `${years}y ${remainingMonths}m`;
    },
    toggleExplanation(index) {
      console.log('Toggle explanation for index:', index);
      
      this.openExplanations = {
        ...this.openExplanations,
        [index]: !this.openExplanations[index]
      };
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
  watch: {
    scenarios: {
      handler(newScenarios) {
        if (newScenarios && newScenarios.length) {
          console.log('Scenarios updated:', newScenarios);
          // Log the scenarios to help debug the time saved issue
          newScenarios.forEach((scenario, index) => {
            console.log(`Scenario ${index} (${scenario.label}):`);
            console.log(`  Monthly payment: ${scenario.monthlyPayment}`);
            console.log(`  Months saved: ${scenario.monthsSaved}`);
            console.log(`  Time to payoff: ${scenario.timeToPayoff.years}y ${scenario.timeToPayoff.months}m`);
          });
        }
      },
      immediate: true
    }
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

.time-saved-section {
  flex-direction: column;
}

.time-saved-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  cursor: pointer;
  padding: 8px;
  transition: background-color 0.2s;
  border-radius: 4px;
  background-color: #f1f5f9;
  margin-top: 4px;
}

.time-saved-header:hover {
  background-color: #e2e8f0;
}

.time-saved-label {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-right: 8px;
}

.dropdown-button {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #3b82f6;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.dropdown-button svg {
  transition: transform 0.3s ease;
}

.dropdown-button.open svg {
  transform: rotate(180deg);
}

.dropdown-text {
  white-space: nowrap;
}

.time-saved-explanation {
  margin-top: 8px;
  padding: 12px;
  background-color: #f8fafc;
  border-radius: 6px;
  font-size: 0.8rem;
  border-left: 3px solid #3b82f6;
}

.explanation-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.advisor-intro {
  margin: 0 0 8px 0;
  font-weight: 500;
  color: #1e40af;
}

.explanation-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px dashed #e2e8f0;
}

.explanation-item.highlight {
  background-color: #dbeafe;
  padding: 6px 4px;
  border-radius: 4px;
  border-bottom: none;
  font-weight: 500;
}

.item-label {
  color: #64748b;
}

.advisor-tip {
  margin: 8px 0 0 0;
  padding: 8px;
  background-color: #ecfdf5;
  border-radius: 4px;
  border-left: 3px solid #10b981;
  color: #065f46;
  line-height: 1.4;
}

.view-toggle {
  display: flex;
  margin: 1.5rem 0 1rem;
  border-radius: 0.5rem;
  overflow: hidden;
  width: fit-content;
  border: 1px solid #e2e8f0;
}

.view-toggle button {
  padding: 0.5rem 1rem;
  background-color: white;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.view-toggle button.active {
  background-color: #3b82f6;
  color: white;
  font-weight: 500;
}

.view-toggle button:not(.active):hover {
  background-color: #f1f5f9;
}
</style>
