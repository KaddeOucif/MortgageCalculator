// Remove the Chart.js import since we're loading it from CDN
// import Chart from 'https://cdn.skypack.dev/chart.js';

// Core calculation logic
export const AMORTIZATION_RULES = {
  HIGH_LTV: { threshold: 0.7, rate: 0.02 },
  MEDIUM_LTV: { threshold: 0.5, rate: 0.01 },
  LOW_LTV: { threshold: 0, rate: 0 }
};

// Additional Swedish rules
const DEBT_TO_INCOME_LIMIT = 4.5; // 450% of gross income
const STRESS_TEST_RATE_INCREASE = 3; // 3 percentage points higher
const MIN_INTEREST_RATE = 6; // Minimum rate for stress test

export function calculateMortgage(
  originalLoanAmount,  // Total original loan
  currentLoanAmount,   // Current remaining loan
  propertyValue,
  annualIncome,
  interestRate,
  loanTermYears
) {
  const ltv = currentLoanAmount / propertyValue;  // Use current loan for LTV
  const debtToIncome = currentLoanAmount / annualIncome;
  
  // Determine base amortization rate
  let amortizationRate = 0;
  if (ltv > AMORTIZATION_RULES.HIGH_LTV.threshold) {
    amortizationRate = AMORTIZATION_RULES.HIGH_LTV.rate;
  } else if (ltv > AMORTIZATION_RULES.MEDIUM_LTV.threshold) {
    amortizationRate = AMORTIZATION_RULES.MEDIUM_LTV.rate;
  }
  
  // Additional amortization for high debt-to-income
  if (debtToIncome > DEBT_TO_INCOME_LIMIT) {
    amortizationRate += 0.01; // Additional 1% amortization
  }

  const monthlyInterestRate = interestRate / 12 / 100;
  const monthlyAmortization = (currentLoanAmount * amortizationRate) / 12;
  const monthlyInterest = currentLoanAmount * monthlyInterestRate;

  // Calculate stress test
  const stressTestRate = Math.max(interestRate + STRESS_TEST_RATE_INCREASE, MIN_INTEREST_RATE);
  const stressTestMonthlyPayment = (currentLoanAmount * (stressTestRate / 12 / 100)) + monthlyAmortization;

  // Calculate amortization schedule
  const schedule = calculateAmortizationSchedule(currentLoanAmount, interestRate, amortizationRate, loanTermYears);
  
  return {
    monthlyAmortization,
    monthlyInterest,
    totalMonthlyPayment: monthlyAmortization + monthlyInterest,
    effectiveInterestRate: interestRate,
    amortizationRate: amortizationRate * 100,
    debtToIncome: debtToIncome * 100,
    stressTestMonthlyPayment,
    schedule,
    isAffordable: stressTestMonthlyPayment < (annualIncome / 12) * 0.4 // 40% of monthly income
  };
}

function calculateAmortizationSchedule(initialLoan, interestRate, amortizationRate, years) {
  let remainingLoan = initialLoan;
  const schedule = [];
  
  for (let year = 1; year <= years; year++) {
    const yearlyAmortization = remainingLoan * amortizationRate;
    const yearlyInterest = remainingLoan * (interestRate / 100);
    remainingLoan -= yearlyAmortization;
    
    schedule.push({
      year,
      remainingLoan,
      yearlyAmortization,
      yearlyInterest,
      totalPayment: yearlyAmortization + yearlyInterest
    });
  }
  
  return schedule;
}

// Add new calculation helpers
function calculateTimeToPayoff(loanAmount, monthlyPayment, interestRate, extraOneTimePayment = 0) {
  const monthlyRate = interestRate / 12 / 100;
  let months = 0;
  let balance = loanAmount - extraOneTimePayment; // Deduct one-time payment immediately
  
  while (balance > 0 && months < 600) { // 50 years max
    balance = balance * (1 + monthlyRate) - monthlyPayment;
    months++;
  }
  
  return {
    years: Math.floor(months / 12),
    months: months % 12,
    finalBalance: balance
  };
}

function calculateExtraPaymentScenarios(currentLoan, baseMonthlyPayment, interestRate) {
  const scenarios = [
    { extra: 1000, label: '+1,000 SEK/month', color: '#4caf50' },
    { extra: 2000, label: '+2,000 SEK/month', color: '#2196f3' },
    { extra: 5000, label: '+5,000 SEK/month', color: '#9c27b0' },
    { extra: baseMonthlyPayment * 0.5, label: '+50% payment', color: '#ff9800' },
    { extra: baseMonthlyPayment, label: 'Double payment', color: '#f44336' }
  ];

  return scenarios.map(scenario => {
    const totalMonthly = baseMonthlyPayment + scenario.extra;
    const timeToPayoff = calculateTimeToPayoff(currentLoan, totalMonthly, interestRate);
    const totalInterest = (totalMonthly * (timeToPayoff.years * 12 + timeToPayoff.months)) - currentLoan;
    const monthsSaved = (30 * 12) - (timeToPayoff.years * 12 + timeToPayoff.months);
    
    return {
      ...scenario,
      monthlyPayment: totalMonthly,
      timeToPayoff,
      totalInterest,
      interestSaved: (currentLoan * interestRate / 100 * 30) - totalInterest,
      monthsSaved
    };
  });
}

// UI handling
export class MortgageCalculator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.loadSavedValues();
    this.render();
    this.setupListeners();
    this.chart = null;
  }

  loadSavedValues() {
    const saved = localStorage.getItem('mortgageCalculator');
    if (saved) {
      this.values = JSON.parse(saved);
    } else {
      this.values = {
        originalLoanAmount: 2000000,
        currentLoanAmount: 2000000,
        propertyValue: 3000000,
        annualIncome: 500000,
        interestRate: 3.5,
        loanTermYears: 30,
        startDate: new Date().toISOString().split('T')[0]
      };
    }
  }

  setupListeners() {
    const inputs = this.shadowRoot.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        const newValue = input.type === 'number' ? Number(input.value) : input.value;
        
        if (input.id === 'originalLoanAmount') {
          // Ensure current loan amount doesn't exceed original loan
          if (this.values.currentLoanAmount > newValue) {
            this.values.currentLoanAmount = newValue;
            this.shadowRoot.querySelector('#currentLoanAmount').value = newValue;
          }
        }
        
        if (input.id === 'currentLoanAmount') {
          // Ensure current loan doesn't exceed original loan
          if (newValue > this.values.originalLoanAmount) {
            input.value = this.values.originalLoanAmount;
            this.values.currentLoanAmount = this.values.originalLoanAmount;
          } else {
            this.values.currentLoanAmount = newValue;
          }
        }
        
        this.values[input.id] = newValue;
        localStorage.setItem('mortgageCalculator', JSON.stringify(this.values));
        this.updateResults();
      });
    });

    // Setup tab switching
    const tabButtons = this.shadowRoot.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const tabId = button.dataset.tab;
        const tabs = this.shadowRoot.querySelectorAll('.tab-content > div');
        tabs.forEach(tab => {
          tab.style.display = tab.id.includes(tabId) ? 'block' : 'none';
        });
      });
    });

    // Setup custom payment calculator
    const calculateCustomBtn = this.shadowRoot.querySelector('#calculateCustom');
    if (calculateCustomBtn) {
      calculateCustomBtn.addEventListener('click', () => this.calculateCustomScenario());
    }
    
    this.updateResults();

    // Export button
    const exportBtn = this.shadowRoot.querySelector('#exportBtn');
    exportBtn.addEventListener('click', () => this.exportCalculations());

    // Share button
    const shareBtn = this.shadowRoot.querySelector('#shareBtn');
    shareBtn.addEventListener('click', () => this.shareCalculator());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Export shortcut (Cmd/Ctrl + E)
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        this.exportCalculations();
      }
      
      // Share shortcut (Cmd/Ctrl + S)
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        this.shareCalculator();
      }

      // Quick navigation between tabs (Alt + 1,2)
      if (e.altKey && e.key === '1') {
        this.switchTab('scenarios');
      }
      if (e.altKey && e.key === '2') {
        this.switchTab('amortization');
      }
    });

    // Add save button handler
    this.shadowRoot.querySelector('#saveCurrentBtn').addEventListener('click', () => {
      this.saveCurrentCalculation();
    });

    // Setup import handlers
    this.setupImportHandlers();

    // Initial load of saved calculations
    this.updateSavedCalculationsList();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 20px;
          background: #f8fafc;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .calculator-container {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          padding: 32px;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .header {
          text-align: center;
          margin-bottom: 32px;
        }

        .header h1 {
          font-size: 1.8rem;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .header p {
          color: #64748b;
        }

        .input-section {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }

        .form-group {
          position: relative;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #64748b;
          font-size: 0.9rem;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .results-section {
          background: #f8fafc;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 32px;
        }

        .results-section h3 {
          margin: 0 0 16px 0;
          color: #1e293b;
          font-size: 1.2rem;
        }

        .result-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .total {
          font-weight: 600;
          border-top: 2px solid #e2e8f0;
          margin-top: 12px;
          padding-top: 12px;
        }

        .warning {
          color: #dc2626;
          padding: 12px;
          margin-top: 12px;
          background: #fef2f2;
          border-radius: 8px;
        }

        .tab-container {
          margin-top: 32px;
        }

        .tab-buttons {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
        }

        .tab-button {
          padding: 12px 24px;
          background: #f1f5f9;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.95rem;
          color: #64748b;
          transition: all 0.2s;
        }

        .tab-button:hover {
          background: #e2e8f0;
        }

        .tab-button.active {
          background: #3b82f6;
          color: white;
        }

        .custom-payment {
          background: #f8fafc;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .custom-payment h3 {
          margin: 0 0 16px 0;
          font-size: 1.1rem;
        }

        .custom-payment input {
          width: 200px;
          margin: 0 12px;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }

        .custom-payment button {
          padding: 8px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        .comparison-section {
          background: #f0f9ff;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .scenario-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .scenario-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          transition: transform 0.2s;
        }

        .scenario-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .scenario-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #3b82f6;
          margin-bottom: 16px;
        }

        .scenario-detail {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .chart-container {
          height: 400px;
          margin-top: 24px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .action-button:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .keyboard-shortcut {
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.8rem;
          margin-left: 8px;
        }

        .payment-options {
          display: grid;
          gap: 16px;
          margin: 20px 0;
        }

        .payment-option {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .payment-option label {
          min-width: 160px;
        }

        .payment-option input {
          flex: 1;
          max-width: 200px;
        }

        @media (max-width: 768px) {
          .input-section {
            grid-template-columns: 1fr;
          }
          
          .calculator-container {
            padding: 20px;
          }
        }

        .calculator-layout {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 24px;
        }

        .dashboard-tray {
          width: 280px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          padding: 20px;
          height: fit-content;
          position: sticky;
          top: 20px;
        }

        .saved-calculations {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 16px;
        }

        .calculation-item {
          padding: 12px;
          border-radius: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .calculation-item:hover {
          transform: translateX(4px);
          background: #f1f5f9;
        }

        .calculation-item.active {
          background: #eff6ff;
          border-color: #3b82f6;
        }

        .calculation-item .title {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .calculation-item .details {
          font-size: 0.9rem;
          color: #64748b;
        }

        .calculation-actions {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }

        .tray-button {
          padding: 8px 16px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .tray-button.primary {
          background: #3b82f6;
          color: white;
        }

        .tray-button.secondary {
          background: #f1f5f9;
          color: #1e293b;
        }

        .tray-button:hover {
          transform: translateY(-1px);
        }

        .import-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .import-dialog {
          background: white;
          padding: 24px;
          border-radius: 16px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .import-dialog h3 {
          margin: 0 0 16px 0;
        }

        .drop-zone {
          border: 2px dashed #e2e8f0;
          border-radius: 8px;
          padding: 32px;
          text-align: center;
          margin-bottom: 16px;
          transition: all 0.2s;
        }

        .drop-zone.drag-over {
          border-color: #3b82f6;
          background: #eff6ff;
        }
      </style>
      
      <div class="calculator-layout">
        <div class="dashboard-tray">
          <h3>Saved Calculations</h3>
          <div class="saved-calculations" id="savedCalculations">
            <!-- Saved calculations will be inserted here -->
          </div>
          <div class="calculation-actions">
            <button class="tray-button primary" id="saveCurrentBtn">
              💾 Save Current
            </button>
            <button class="tray-button secondary" id="importBtn">
              📥 Import
            </button>
          </div>
        </div>

        <div class="calculator-container">
          <div class="header">
            <h1>Swedish Mortgage Calculator</h1>
            <p>Calculate your mortgage payments and explore different payment strategies</p>
          </div>

          <div class="input-section">
            <div class="form-group">
              <label>Original Loan Amount (SEK)</label>
              <input type="number" id="originalLoanAmount" value="${this.values.originalLoanAmount}">
              <div class="tooltip">Initial loan amount when you took the mortgage</div>
            </div>
            
            <div class="form-group">
              <label>Current Loan Amount (SEK)</label>
              <input type="number" id="currentLoanAmount" value="${this.values.currentLoanAmount}">
              <div class="tooltip">Your current remaining loan balance</div>
            </div>
            
            <div class="form-group">
              <label>Property Value (SEK)</label>
              <input type="number" id="propertyValue" value="${this.values.propertyValue}">
              <div class="tooltip">Current market value of your property</div>
            </div>
            
            <div class="form-group">
              <label>Annual Income (SEK)</label>
              <input type="number" id="annualIncome" value="${this.values.annualIncome}">
              <div class="tooltip">Your total yearly income before tax</div>
            </div>
            
            <div class="form-group">
              <label>Interest Rate (%)</label>
              <input type="number" id="interestRate" step="0.1" value="${this.values.interestRate}">
              <div class="tooltip">Current interest rate on your mortgage</div>
            </div>
            
            <div class="form-group">
              <label>Loan Term (Years)</label>
              <input type="number" id="loanTermYears" value="${this.values.loanTermYears}">
              <div class="tooltip">Total length of your mortgage in years</div>
            </div>
          </div>

          <div class="results-section">
            <h3>Monthly Payment Breakdown</h3>
            <div id="results"></div>
          </div>

          <div class="tab-container">
            <div class="tab-buttons">
              <button class="tab-button active" data-tab="scenarios">Payment Strategies</button>
              <button class="tab-button" data-tab="amortization">Amortization Chart</button>
            </div>
            
            <div class="tab-content">
              <div id="scenarios-tab" class="scenarios-section">
                <div class="custom-payment">
                  <h3>Calculate Extra Payments</h3>
                  <div class="payment-options">
                    <div class="payment-option">
                      <label>Extra monthly payment:</label>
                      <input type="number" id="customMonthly" placeholder="e.g. 3000" step="500">
                    </div>
                    <div class="payment-option">
                      <label>One-time extra payment:</label>
                      <input type="number" id="customOneTime" placeholder="e.g. 400000" step="10000">
                    </div>
                    <button id="calculateCustom">Calculate</button>
                  </div>
                  <div id="customScenarioResult"></div>
                </div>

                <h3>Payment Strategies</h3>
                <div class="comparison-section">
                  <strong>Current Path:</strong> 
                  <div id="current-path-details"></div>
                </div>
                <div class="scenario-grid" id="scenario-grid"></div>
              </div>
              
              <div id="amortization-tab" class="chart-container" style="display: none;">
                <canvas id="amortizationChart"></canvas>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <button class="action-button" id="exportBtn">
              Export Calculations
              <span class="keyboard-shortcut">⌘E</span>
            </button>
            <button class="action-button" id="shareBtn">
              Share Calculator
              <span class="keyboard-shortcut">⌘S</span>
            </button>
          </div>
        </div>
      </div>

      <div class="import-overlay" id="importOverlay">
        <div class="import-dialog">
          <h3>Import Calculation</h3>
          <div class="drop-zone" id="dropZone">
            Drop your calculation file here
            or click to select
          </div>
          <input type="file" id="fileInput" style="display: none" accept=".json">
          <div class="calculation-actions">
            <button class="tray-button secondary" id="cancelImport">Cancel</button>
          </div>
        </div>
      </div>
    `;

    this.setupListeners();
    this.updateResults();
  }

  updateResults() {
    const results = calculateMortgage(
      this.values.originalLoanAmount,
      this.values.currentLoanAmount,
      this.values.propertyValue,
      this.values.annualIncome,
      this.values.interestRate,
      this.values.loanTermYears
    );

    const resultsDiv = this.shadowRoot.querySelector('#results');
    resultsDiv.innerHTML = `
      <div class="result-item">
        <span>Monthly Amortization:</span>
        <span>${this.formatCurrency(results.monthlyAmortization)} SEK</span>
      </div>
      <div class="result-item">
        <span>Monthly Interest:</span>
        <span>${this.formatCurrency(results.monthlyInterest)} SEK</span>
      </div>
      <div class="result-item total">
        <span>Total Monthly Payment:</span>
        <span>${this.formatCurrency(results.totalMonthlyPayment)} SEK</span>
      </div>
      <div class="result-item">
        <span>Required Amortization Rate:</span>
        <span>${results.amortizationRate.toFixed(1)}%</span>
      </div>
      <div class="result-item">
        <span>Debt-to-Income Ratio:</span>
        <span>${results.debtToIncome.toFixed(1)}%</span>
      </div>
      <div class="result-item">
        <span>Stress Test Monthly Payment:</span>
        <span>${this.formatCurrency(results.stressTestMonthlyPayment)} SEK</span>
      </div>
      ${!results.isAffordable ? '<div class="warning">Warning: Monthly payments may be too high for your income</div>' : ''}
    `;

    // Update payment scenarios
    const scenarios = calculateExtraPaymentScenarios(
      this.values.currentLoanAmount,
      results.totalMonthlyPayment,
      this.values.interestRate
    );

    const currentPath = calculateTimeToPayoff(
      this.values.currentLoanAmount,
      results.totalMonthlyPayment,
      this.values.interestRate
    );

    const currentPathDetails = this.shadowRoot.querySelector('#current-path-details');
    if (currentPathDetails) {
      currentPathDetails.innerHTML = `
        With current monthly payment of ${this.formatCurrency(results.totalMonthlyPayment)} SEK,
        you will pay off the loan in ${currentPath.years} years and ${currentPath.months} months.
      `;
    }

    const scenarioGrid = this.shadowRoot.querySelector('#scenario-grid');
    if (scenarioGrid) {
      scenarioGrid.innerHTML = scenarios.map(scenario => `
        <div class="scenario-card">
          <div class="scenario-title">${scenario.label}</div>
          <div class="scenario-detail">
            <span>Monthly Payment:</span>
            <span>${this.formatCurrency(scenario.monthlyPayment)} SEK</span>
          </div>
          <div class="scenario-detail">
            <span>Time to Payoff:</span>
            <span>${scenario.timeToPayoff.years}y ${scenario.timeToPayoff.months}m</span>
          </div>
          <div class="scenario-detail">
            <span>Interest Saved:</span>
            <span>${this.formatCurrency(scenario.interestSaved)} SEK</span>
          </div>
        </div>
      `).join('');
    }

    this.updateChart(results.schedule);
  }

  updateChart(schedule) {
    const ctx = this.shadowRoot.querySelector('#amortizationChart');
    if (!ctx) return;
    
    if (this.chart) {
      this.chart.destroy();
    }

    const labels = schedule.map(item => `Year ${item.year}`);
    const remainingLoan = schedule.map(item => item.remainingLoan);
    const yearlyPayments = schedule.map(item => item.totalPayment);

    // Calculate scenario data
    const results = calculateMortgage(
      this.values.originalLoanAmount,
      this.values.currentLoanAmount,
      this.values.propertyValue,
      this.values.annualIncome,
      this.values.interestRate,
      this.values.loanTermYears
    );

    const scenarios = calculateExtraPaymentScenarios(
      this.values.currentLoanAmount,
      results.totalMonthlyPayment,
      this.values.interestRate
    );

    // Create datasets for each scenario
    const scenarioDatasets = scenarios.map(scenario => {
      let balance = this.values.currentLoanAmount;
      const data = [];
      
      for (let year = 1; year <= this.values.loanTermYears; year++) {
        const yearlyPayment = scenario.monthlyPayment * 12;
        const yearlyInterest = balance * (this.values.interestRate / 100);
        balance = Math.max(0, balance - (yearlyPayment - yearlyInterest));
        data.push(balance);
      }

      return {
        label: scenario.label,
        data: data,
        borderColor: scenario.color,
        backgroundColor: `${scenario.color}22`,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: scenario.color,
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        hidden: true // Hidden by default
      };
    });

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Current Plan',
            data: remainingLoan,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: 'rgb(75, 192, 192)',
            pointBorderColor: 'white',
            pointBorderWidth: 2
          },
          ...scenarioDatasets
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart',
          delay: (context) => context.dataIndex * 100
        },
        transitions: {
          show: {
            animations: {
              x: {
                from: 0
              },
              y: {
                from: 0
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'start',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 14
              },
              filter: (legendItem, data) => {
                return !legendItem.text.includes('Yearly Payments');
              }
            },
            onClick: (e, legendItem, legend) => {
              const index = legendItem.datasetIndex;
              const ci = legend.chart;
              if (ci.isDatasetVisible(index)) {
                ci.hide(index);
                legendItem.hidden = true;
              } else {
                ci.show(index);
                legendItem.hidden = false;
              }
              ci.update();
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#1e293b',
            bodyColor: '#1e293b',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true,
            callbacks: {
              label: (context) => {
                const value = context.raw;
                return ` ${context.dataset.label}: ${Math.round(value).toLocaleString('sv-SE')} SEK`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 12
              }
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => `${Math.round(value).toLocaleString('sv-SE')} SEK`,
              font: {
                size: 12
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        }
      }
    });
  }

  calculateCustomScenario() {
    const monthlyExtra = Number(this.shadowRoot.querySelector('#customMonthly').value) || 0;
    const oneTimeExtra = Number(this.shadowRoot.querySelector('#customOneTime').value) || 0;
    
    const results = calculateMortgage(
      this.values.originalLoanAmount,
      this.values.currentLoanAmount,
      this.values.propertyValue,
      this.values.annualIncome,
      this.values.interestRate,
      this.values.loanTermYears
    );

    const baseMonthlyPayment = results.totalMonthlyPayment;
    const newMonthlyPayment = baseMonthlyPayment + monthlyExtra;

    // Calculate time to payoff with both extra monthly and one-time payment
    const payoffDetails = calculateTimeToPayoff(
      this.values.currentLoanAmount,
      newMonthlyPayment,
      this.values.interestRate,
      oneTimeExtra
    );

    // Calculate baseline scenario (without extra payments)
    const baselinePayoff = calculateTimeToPayoff(
      this.values.currentLoanAmount,
      baseMonthlyPayment,
      this.values.interestRate
    );

    // Calculate total interest for both scenarios
    const baselineInterest = (baseMonthlyPayment * (baselinePayoff.years * 12 + baselinePayoff.months)) - this.values.currentLoanAmount;
    const newTotalInterest = (newMonthlyPayment * (payoffDetails.years * 12 + payoffDetails.months)) - (this.values.currentLoanAmount - oneTimeExtra);
    const interestSaved = baselineInterest - newTotalInterest;
    const monthsSaved = (baselinePayoff.years * 12 + baselinePayoff.months) - (payoffDetails.years * 12 + payoffDetails.months);

    const customResult = this.shadowRoot.querySelector('#customScenarioResult');
    customResult.innerHTML = `
      <div class="scenario-card">
        <div class="scenario-title">Custom Payment Plan</div>
        <div class="scenario-detail">
          <span>New Monthly Payment:</span>
          <span>${this.formatCurrency(newMonthlyPayment)} SEK</span>
        </div>
        <div class="scenario-detail">
          <span>One-time Payment:</span>
          <span>${this.formatCurrency(oneTimeExtra)} SEK</span>
        </div>
        <div class="scenario-detail">
          <span>New Loan Balance:</span>
          <span>${this.formatCurrency(this.values.currentLoanAmount - oneTimeExtra)} SEK</span>
        </div>
        <div class="scenario-detail">
          <span>Time to Payoff:</span>
          <span>${payoffDetails.years}y ${payoffDetails.months}m</span>
        </div>
        <div class="scenario-detail">
          <span>Interest Saved:</span>
          <span>${this.formatCurrency(interestSaved)} SEK</span>
        </div>
        <div class="scenario-detail">
          <span>Time Saved:</span>
          <span>${Math.floor(monthsSaved / 12)}y ${monthsSaved % 12}m</span>
        </div>
      </div>
    `;

    // Update the chart to show this scenario
    this.updateChart(results.schedule, {
      monthlyExtra,
      oneTimeExtra,
      label: 'Custom Plan'
    });
  }

  formatCurrency(value) {
    return Math.round(value).toLocaleString('sv-SE');
  }

  exportCalculations() {
    const results = calculateMortgage(
      this.values.originalLoanAmount,
      this.values.currentLoanAmount,
      this.values.propertyValue,
      this.values.annualIncome,
      this.values.interestRate,
      this.values.loanTermYears
    );

    const scenarios = calculateExtraPaymentScenarios(
      this.values.currentLoanAmount,
      results.totalMonthlyPayment,
      this.values.interestRate
    );

    const exportData = {
      date: new Date().toISOString(),
      inputs: this.values,
      monthlyPayments: {
        amortization: results.monthlyAmortization,
        interest: results.monthlyInterest,
        total: results.totalMonthlyPayment,
        stressTest: results.stressTestMonthlyPayment
      },
      rates: {
        amortization: results.amortizationRate,
        debtToIncome: results.debtToIncome,
        interest: results.effectiveInterestRate
      },
      paymentScenarios: scenarios,
      amortizationSchedule: results.schedule
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mortgage-calculation-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  switchTab(tabId) {
    const tabButtons = this.shadowRoot.querySelectorAll('.tab-button');
    const targetButton = Array.from(tabButtons).find(btn => btn.dataset.tab === tabId);
    if (targetButton) {
      targetButton.click();
    }
  }

  shareCalculator() {
    const shareData = {
      title: 'Swedish Mortgage Calculator',
      text: `Check out my mortgage calculation:\nLoan Amount: ${this.formatCurrency(this.values.currentLoanAmount)} SEK\nMonthly Payment: ${this.formatCurrency(this.values.monthlyPayment)} SEK`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData)
        .catch((err) => {
          console.error('Share failed:', err);
        });
    } else {
      // Fallback to copying to clipboard
      const shareText = `${shareData.text}\n${shareData.url}`;
      navigator.clipboard.writeText(shareText)
        .then(() => {
          alert('Calculator link copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy:', err);
        });
    }
  }

  saveCurrentCalculation() {
    const savedCalculations = this.getSavedCalculations();
    const newCalculation = {
      id: Date.now(),
      date: new Date().toISOString(),
      name: `Calculation ${savedCalculations.length + 1}`,
      values: { ...this.values },
      results: calculateMortgage(
        this.values.originalLoanAmount,
        this.values.currentLoanAmount,
        this.values.propertyValue,
        this.values.annualIncome,
        this.values.interestRate,
        this.values.loanTermYears
      )
    };

    savedCalculations.push(newCalculation);
    localStorage.setItem('savedCalculations', JSON.stringify(savedCalculations));
    this.updateSavedCalculationsList();
  }

  getSavedCalculations() {
    const saved = localStorage.getItem('savedCalculations');
    return saved ? JSON.parse(saved) : [];
  }

  updateSavedCalculationsList() {
    const savedList = this.shadowRoot.querySelector('#savedCalculations');
    const calculations = this.getSavedCalculations();

    savedList.innerHTML = calculations.map(calc => `
      <div class="calculation-item" data-id="${calc.id}">
        <div class="title">${calc.name}</div>
        <div class="details">
          Loan: ${this.formatCurrency(calc.values.currentLoanAmount)} SEK
          <br>
          Monthly: ${this.formatCurrency(calc.results.totalMonthlyPayment)} SEK
        </div>
      </div>
    `).join('');

    // Add click handlers
    savedList.querySelectorAll('.calculation-item').forEach(item => {
      item.addEventListener('click', () => this.loadCalculation(item.dataset.id));
    });
  }

  loadCalculation(id) {
    const calculations = this.getSavedCalculations();
    const calculation = calculations.find(calc => calc.id === Number(id));
    if (calculation) {
      this.values = { ...calculation.values };
      this.render();
      this.updateResults();
    }
  }

  setupImportHandlers() {
    const overlay = this.shadowRoot.querySelector('#importOverlay');
    const dropZone = this.shadowRoot.querySelector('#dropZone');
    const fileInput = this.shadowRoot.querySelector('#fileInput');

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      this.handleImportFile(file);
    });

    dropZone.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      this.handleImportFile(file);
    });

    this.shadowRoot.querySelector('#importBtn').addEventListener('click', () => {
      overlay.style.display = 'flex';
    });

    this.shadowRoot.querySelector('#cancelImport').addEventListener('click', () => {
      overlay.style.display = 'none';
    });
  }

  handleImportFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        const savedCalculations = this.getSavedCalculations();
        
        savedCalculations.push({
          id: Date.now(),
          date: new Date().toISOString(),
          name: `Imported ${new Date().toLocaleDateString()}`,
          values: imported.inputs,
          results: imported.monthlyPayments
        });

        localStorage.setItem('savedCalculations', JSON.stringify(savedCalculations));
        this.updateSavedCalculationsList();
        this.shadowRoot.querySelector('#importOverlay').style.display = 'none';
      } catch (err) {
        alert('Invalid calculation file');
      }
    };
    reader.readAsText(file);
  }
} 