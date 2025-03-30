<template>
  <div class="investment-comparison">
    <div class="comparison-header">
      <h3>Investment Comparison</h3>
      <div class="info-tooltip">
        <span class="info-icon">i</span>
        <div class="tooltip-content">
          <p>This chart compares two strategies for your extra money:</p>
          <p><strong>1. Pay extra on your mortgage:</strong> Reduce debt faster and save on interest</p>
          <p><strong>2. Invest in the stock market:</strong> Keep minimum mortgage payments and invest the difference</p>
          <p>The comparison assumes a {{ expectedReturn.toFixed(1) }}% average annual stock market return.</p>
        </div>
      </div>
    </div>
    
    <div class="settings-panel">
      <div class="setting-group">
        <label for="expected-return">Expected Annual Stock Return (%)</label>
        <input 
          type="number" 
          id="expected-return" 
          v-model.number="expectedReturn" 
          min="0" 
          max="15" 
          step="0.5"
        >
        <div class="setting-info">
          <span class="info-icon small">?</span>
          <div class="tooltip-content">
            <p><strong>About Stock Market Returns:</strong></p>
            <p>The Swedish stock market (OMXS30) has historically returned around 7-8% annually over the long term.</p>
            <p>Higher returns come with higher risk. Adjust based on your investment strategy and risk tolerance.</p>
          </div>
        </div>
      </div>
      <div class="setting-group">
        <label for="account-type">Investment Account Type</label>
        <select id="account-type" v-model="accountType">
          <option value="isk">ISK (Investeringssparkonto)</option>
          <option value="standard">Standard Account (30% Capital Gains)</option>
        </select>
        <div class="setting-info">
          <span class="info-icon small">?</span>
          <div class="tooltip-content">
            <p><strong>Swedish Investment Accounts:</strong></p>
            <p><strong>ISK (Investeringssparkonto):</strong> Taxed at a flat rate on the entire account value (currently about 0.375% of total account value annually)</p>
            <p><strong>Standard Account:</strong> 30% tax on realized capital gains</p>
            <p>Most Swedish investors prefer ISK accounts for their simplicity and typically lower tax burden.</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="calculation-info">
      <div class="info-box">
        <div class="info-header">
          <h4>How This Comparison Works</h4>
          <span class="info-icon">?</span>
          <div class="tooltip-content wide">
            <h5>Calculation Methodology</h5>
            <p><strong>Mortgage Strategy:</strong></p>
            <ul>
              <li>We calculate how much interest you save by paying extra on your mortgage</li>
              <li>We determine how much sooner you'll pay off your mortgage</li>
              <li>Net worth = property value (assuming it equals your loan amount)</li>
              <li>In this strategy, your mortgage is fully paid off</li>
            </ul>
            
            <p><strong>Investment Strategy:</strong></p>
            <ul>
              <li>We simulate investing your extra payment amount monthly in the stock market</li>
              <li>We compound returns monthly at your specified annual rate</li>
              <li>We apply Swedish ISK tax (approximately 0.375% of account value annually)</li>
              <li>Net worth = investment value (after accounting for tax)</li>
              <li>In this strategy, your property value and mortgage balance cancel each other out</li>
            </ul>
            
            <p><strong>Swedish ISK Tax Calculation:</strong></p>
            <ul>
              <li>ISK accounts are taxed on the entire account value, not just gains</li>
              <li>The tax is based on the government borrowing rate + 1% (minimum 1.25%)</li>
              <li>This rate is then taxed at 30%</li>
              <li>Currently, this results in approximately 0.375% annual tax on the account value</li>
              <li>This is typically more favorable than the standard 30% capital gains tax</li>
            </ul>
            
            <p><strong>Important Note:</strong> This is a simplified model. Real-world results depend on market performance, interest rate changes, and your specific tax situation.</p>
          </div>
        </div>
        <p>This tool compares the financial impact of paying extra on your mortgage versus investing that same amount in the stock market. Adjust the expected return to match your investment strategy.</p>
      </div>
    </div>
    
    <div class="comparison-grid">
      <div v-for="(scenario, index) in comparisonScenarios" :key="index" class="comparison-card">
        <div class="scenario-header" :style="{ borderLeftColor: scenario.color }">
          <h4>{{ scenario.label }}</h4>
          <button class="details-button" @click="toggleDetails(index)">
            {{ showDetails[index] ? 'Hide details' : 'Show details' }}
          </button>
        </div>
        
        <div class="comparison-results">
          <div class="result-column">
            <h5>Pay Extra on Mortgage</h5>
            <div class="result-item">
              <span>Total Interest Saved:</span>
              <span class="value">{{ formatCurrency(scenario.mortgageStrategy.interestSaved) }} SEK</span>
            </div>
            <div class="result-item">
              <span>Time Saved:</span>
              <span class="value">{{ formatTimeSaved(scenario.mortgageStrategy.monthsSaved) }}</span>
            </div>
            <div class="result-item">
              <span>Payoff Timeline:</span>
              <span class="value">{{ formatExactTime(scenario.mortgageStrategy.timeToPayoff) }}</span>
            </div>
            <div class="result-item highlight">
              <span>Net Worth at Payoff:</span>
              <div class="value-breakdown">
                <span class="value">{{ formatCurrency(scenario.mortgageStrategy.netWorth) }} SEK</span>
                <span class="breakdown">(Property value, mortgage paid off)</span>
              </div>
            </div>
          </div>
          
          <div class="result-column">
            <h5>Invest in Stock Market</h5>
            <div class="result-item">
              <span>Investment Value:</span>
              <span class="value">{{ formatCurrency(scenario.investmentStrategy.finalValue) }} SEK</span>
            </div>
            <div class="result-item">
              <span>After Tax:</span>
              <span class="value">{{ formatCurrency(scenario.investmentStrategy.afterTaxValue) }} SEK</span>
            </div>
            <div class="result-item">
              <span>Comparison Timeline:</span>
              <span class="value">{{ formatExactTime(scenario.mortgageStrategy.timeToPayoff) }}</span>
            </div>
            <div class="result-item highlight">
              <span>Net Worth at Same Time:</span>
              <div class="value-breakdown">
                <span class="value">{{ formatCurrency(scenario.investmentStrategy.netWorth) }} SEK</span>
                <span class="breakdown">(Investments only, mortgage remains)</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="winner-banner" :class="scenario.winner">
          <strong>{{ scenario.winnerText }}</strong>
          <span>{{ scenario.winnerDescription }}</span>
        </div>
        
        <div v-if="showDetails[index]" class="details-section">
          <h5>Financial Advisor Analysis</h5>
          <p>{{ scenario.analysis }}</p>
          
          <div class="risk-section">
            <h6>Risk Considerations:</h6>
            <ul>
              <li><strong>Mortgage Strategy:</strong> Lower risk, guaranteed return equal to your mortgage interest rate ({{ values.interestRate }}%).</li>
              <li><strong>Investment Strategy:</strong> Higher risk, potential for higher returns but also potential losses.</li>
            </ul>
          </div>
          
          <div class="chart-container">
            <!-- We could add a chart here showing the growth over time -->
            <div class="placeholder-chart">
              <div class="chart-line mortgage" :style="{ height: `${scenario.mortgagePercentage}%` }"></div>
              <div class="chart-line investment" :style="{ height: `${scenario.investmentPercentage}%` }"></div>
              <div class="chart-labels">
                <span>Mortgage</span>
                <span>Investment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatCurrency } from '../utils/formatters';
import { calculateComparisonScenarios } from '../calculations/investmentComparison';

export default {
  name: 'InvestmentComparison',
  props: {
    values: {
      type: Object,
      required: true
    },
    results: {
      type: Object,
      required: true
    },
    scenarios: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      expectedReturn: 7,
      accountType: 'isk', // Default to ISK account
      showDetails: {}
    };
  },
  computed: {
    comparisonScenarios() {
      if (!this.scenarios.length) return [];
      
      return calculateComparisonScenarios(
        this.scenarios,
        this.values.currentLoanAmount,
        this.values.interestRate,
        this.expectedReturn,
        this.accountType
      );
    }
  },
  methods: {
    formatCurrency,
    formatTimeSaved(months) {
      const absoluteMonths = Math.abs(months);
      const years = Math.floor(absoluteMonths / 12);
      const remainingMonths = absoluteMonths % 12;
      
      return `${years}y ${remainingMonths}m`;
    },
    toggleDetails(index) {
      this.showDetails = {
        ...this.showDetails,
        [index]: !this.showDetails[index]
      };
    },
    formatExactTime(timeObj) {
      return `${timeObj.years} years and ${timeObj.months} months`;
    }
  }
};
</script>

<style scoped>
.investment-comparison {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.comparison-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.comparison-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.info-tooltip {
  position: relative;
  margin-left: 0.5rem;
}

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  font-size: 12px;
  font-style: italic;
  cursor: help;
}

.info-tooltip:hover .tooltip-content {
  display: block;
}

.tooltip-content {
  display: none;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 10;
  font-size: 0.75rem;
  color: #334155;
  margin-top: 0.5rem;
}

.tooltip-content p {
  margin: 0.5rem 0;
}

.settings-panel {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 0.5rem;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.setting-group label {
  font-size: 0.75rem;
  color: #64748b;
}

.setting-group input {
  width: 5rem;
  padding: 0.25rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.25rem;
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.comparison-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.scenario-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  border-left: 4px solid #ddd;
}

.scenario-header h4 {
  margin: 0;
  font-size: 1rem;
}

.details-button {
  background-color: transparent;
  border: none;
  color: #3b82f6;
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.details-button:hover {
  background-color: #eff6ff;
}

.comparison-results {
  display: flex;
  padding: 1rem;
  gap: 1rem;
}

.result-column {
  flex: 1;
}

.result-column h5 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #64748b;
}

.result-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
}

.result-item .value {
  font-weight: 600;
  font-size: 0.875rem;
}

.result-item.highlight {
  padding: 0.5rem;
  background-color: #f1f5f9;
  border-radius: 0.25rem;
  margin-top: 0.5rem;
}

.winner-banner {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  color: white;
}

.winner-banner.mortgage {
  background-color: #10b981;
}

.winner-banner.investment {
  background-color: #3b82f6;
}

.winner-banner.tie {
  background-color: #9ca3af;
}

.details-section {
  padding: 1rem;
  border-top: 1px solid #f1f5f9;
  font-size: 0.875rem;
}

.details-section h5 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
}

.details-section p {
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.risk-section {
  margin-bottom: 1rem;
}

.risk-section h6 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
}

.risk-section ul {
  margin: 0;
  padding-left: 1.5rem;
}

.risk-section li {
  margin-bottom: 0.25rem;
}

.chart-container {
  margin-top: 1rem;
}

.placeholder-chart {
  height: 150px;
  display: flex;
  align-items: flex-end;
  gap: 2rem;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 0.5rem;
}

.chart-line {
  flex: 1;
  transition: height 0.5s ease;
}

.chart-line.mortgage {
  background-color: #10b981;
}

.chart-line.investment {
  background-color: #3b82f6;
}

.chart-labels {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #64748b;
}

.setting-info {
  position: relative;
  display: inline-block;
  margin-left: 0.25rem;
}

.info-icon.small {
  width: 16px;
  height: 16px;
  font-size: 10px;
  background-color: #64748b;
}

.calculation-info {
  margin-bottom: 1.5rem;
}

.info-box {
  background-color: #f8fafc;
  border-radius: 0.5rem;
  padding: 1rem;
  border-left: 4px solid #3b82f6;
}

.info-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  position: relative;
}

.info-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #334155;
}

.tooltip-content.wide {
  width: 400px;
}

.tooltip-content h5 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #334155;
}

.tooltip-content ul {
  margin: 0.25rem 0 0.75rem 0;
  padding-left: 1.25rem;
}

.tooltip-content li {
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
}

.info-box p {
  margin: 0;
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.5;
}

.value-breakdown {
  display: flex;
  flex-direction: column;
}

.breakdown {
  font-size: 0.7rem;
  color: #64748b;
  font-weight: normal;
  margin-top: 0.25rem;
}
</style> 