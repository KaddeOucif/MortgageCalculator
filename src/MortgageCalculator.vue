<template>
  <div class="mortgage-calculator">
    <div class="header">
      <div class="header-mesh" aria-hidden="true">
        <span class="mesh-orb mesh-orb--1"></span>
        <span class="mesh-orb mesh-orb--2"></span>
        <span class="mesh-orb mesh-orb--3"></span>
      </div>
      <div class="header-content">
        <h1 class="header-title">Mortgage Calculator</h1>
        <p class="header-subtitle">Calculate your mortgage payments, amortization requirements, and explore payment strategies.</p>
      </div>
    </div>
    
    <div class="calculator-grid">
      <LoanInputs 
        :values="values" 
        @update="updateValues" 
      />
      
      <ResultsDisplay 
        v-if="results"
        :results="results" 
        :values="values"
        @save="saveCurrentCalculation"
      />
    </div>
    
    <div class="tabs">
      <div class="tab-buttons">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-button', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
      
      <div class="tab-content">
        <PaymentScenarios 
          v-if="activeTab === 'scenarios' && results" 
          :values="values" 
          :results="results"
        />
        
        <AmortizationChart 
          v-if="activeTab === 'amortization' && results" 
          :schedule="results.schedule"
          :values="values"
          :results="results"
        />
        
        <SavedCalculations 
          v-if="activeTab === 'saved'"
          ref="savedCalculations"
          @load="loadCalculation"
          @rename="renameCalculation"
          @export="exportCalculation"
          @delete="deleteCalculation"
          @import="showImportOverlay = true"
        />
      </div>
    </div>
    
    <!-- Import overlay -->
    <div class="overlay" v-if="showImportOverlay">
      <div class="modal">
        <h3>Import Calculation</h3>
        <p>Upload a previously exported calculation file.</p>
        
        <div 
          class="drop-zone"
          :class="{ 'drag-over': isDragOver }"
          @dragover.prevent="isDragOver = true"
          @dragleave="isDragOver = false"
          @drop.prevent="handleFileDrop"
          @click="triggerFileInput"
        >
          <input 
            type="file" 
            ref="fileInput" 
            style="display: none;" 
            accept=".json"
            @change="handleFileSelect"
          >
          Drop file here or click to browse
        </div>
        
        <div class="modal-actions">
          <button @click="showImportOverlay = false" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
    
    <!-- Rename overlay -->
    <div class="overlay" v-if="showRenameOverlay">
      <div class="modal">
        <h3>Rename Calculation</h3>
        <input 
          type="text" 
          v-model="renameValue" 
          class="rename-input"
          placeholder="Enter new name"
        >
        
        <div class="modal-actions">
          <button @click="confirmRename" class="save-btn">Save</button>
          <button @click="showRenameOverlay = false" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatCurrency } from './utils/formatters';
import { calculateMortgage } from './calculations/mortgageCalculator';
import { saveCalculatorValues, loadCalculatorValues, saveCalculation, deleteCalculation, updateCalculation } from './services/storageServices';
import { exportCalculation as exportCalc, parseImportedCalculation } from './services/exportService';

import LoanInputs from './components/LoanInputs.vue';
import ResultsDisplay from './components/ResultsDisplay.vue';
import PaymentScenarios from './components/PaymentScenarios.vue';
import AmortizationChart from './components/AmortizationChart.vue';
import SavedCalculations from './components/SavedCalculations.vue';

export default {
  name: 'MortgageCalculator',
  components: {
    LoanInputs,
    ResultsDisplay,
    PaymentScenarios,
    AmortizationChart,
    SavedCalculations
  },
  data() {
    return {
      values: {
        originalLoanAmount: 2000000,
        currentLoanAmount: 2000000,
        propertyValue: 3000000,
        annualIncome: 500000,
        interestRate: 3.5,
        loanTermYears: 30,
        brfFee: 3500
      },
      results: null,
      activeTab: 'scenarios',
      tabs: [
        { id: 'scenarios', label: 'Payment Strategies' },
        { id: 'amortization', label: 'Amortization Chart' },
        { id: 'saved', label: 'Saved Calculations' }
      ],
      showImportOverlay: false,
      showRenameOverlay: false,
      isDragOver: false,
      calculationToRename: null,
      renameValue: ''
    };
  },
  created() {
    const savedValues = loadCalculatorValues();
    if (savedValues) {
      this.values = savedValues;
    }
    this.calculateResults();
  },
  methods: {
    formatCurrency,
    updateValues(newValues) {
      this.values = newValues;
      saveCalculatorValues(this.values);
      this.calculateResults();
    },
    calculateResults() {
      if (!this.values.currentLoanAmount || !this.values.propertyValue) return;
      
      this.results = calculateMortgage(
        this.values.originalLoanAmount,
        this.values.currentLoanAmount,
        this.values.propertyValue,
        this.values.annualIncome,
        this.values.interestRate,
        this.values.loanTermYears
      );
    },
    saveCurrentCalculation() {
      const calculationName = prompt('Enter a name for this calculation:', 'My Calculation');
      if (!calculationName) return;
      
      const calculation = {
        id: Date.now().toString(),
        name: calculationName,
        date: new Date().toISOString(),
        ...this.values,
        monthlyPayment: this.results.totalMonthlyPayment
      };
      
      saveCalculation(calculation);
      if (this.$refs.savedCalculations) {
        this.$refs.savedCalculations.loadSavedCalculations();
      }
    },
    loadCalculation(calculation) {
      this.values = {
        originalLoanAmount: calculation.originalLoanAmount,
        currentLoanAmount: calculation.currentLoanAmount,
        propertyValue: calculation.propertyValue,
        annualIncome: calculation.annualIncome,
        interestRate: calculation.interestRate,
        loanTermYears: calculation.loanTermYears,
        brfFee: calculation.brfFee || 0
      };
      
      saveCalculatorValues(this.values);
      this.calculateResults();
    },
    renameCalculation(calculation) {
      this.calculationToRename = calculation;
      this.renameValue = calculation.name;
      this.showRenameOverlay = true;
    },
    confirmRename() {
      if (this.calculationToRename && this.renameValue) {
        const updatedCalculation = {
          ...this.calculationToRename,
          name: this.renameValue
        };
        
        updateCalculation(updatedCalculation);
        if (this.$refs.savedCalculations) {
          this.$refs.savedCalculations.loadSavedCalculations();
        }
        
        this.showRenameOverlay = false;
        this.calculationToRename = null;
        this.renameValue = '';
      }
    },
    deleteCalculation(id) {
      if (confirm('Are you sure you want to delete this calculation?')) {
        deleteCalculation(id);
        if (this.$refs.savedCalculations) {
          this.$refs.savedCalculations.loadSavedCalculations();
        }
      }
    },
    exportCalculation(calculation) {
      exportCalc(calculation);
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.processImportFile(file);
      }
    },
    handleFileDrop(event) {
      this.isDragOver = false;
      const file = event.dataTransfer.files[0];
      if (file) {
        this.processImportFile(file);
      }
    },
    processImportFile(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedCalculation = parseImportedCalculation(e.target.result);
          saveCalculation(importedCalculation);
          if (this.$refs.savedCalculations) {
            this.$refs.savedCalculations.loadSavedCalculations();
          }
          this.showImportOverlay = false;
          alert('Calculation imported successfully!');
        } catch (error) {
          alert('Error importing calculation: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  }
};
</script>

<style scoped>
.mortgage-calculator {
  max-width: 1180px;
  margin: 0 auto;
}

.header {
  position: relative;
  overflow: hidden;
  color: white;
  padding: 3rem 2.25rem;
  border-radius: var(--radius-xl);
  margin-bottom: 1.75rem;
  background:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    radial-gradient(ellipse 90% 70% at 15% 50%, rgba(6, 182, 212, 0.55) 0%, transparent 55%),
    radial-gradient(ellipse 70% 90% at 85% 15%, rgba(168, 85, 247, 0.5) 0%, transparent 50%),
    radial-gradient(ellipse 60% 60% at 70% 85%, rgba(99, 102, 241, 0.45) 0%, transparent 55%),
    radial-gradient(ellipse 40% 40% at 50% 30%, rgba(236, 72, 153, 0.15) 0%, transparent 60%),
    linear-gradient(135deg, #0f172a 0%, #1e1b4b 22%, #312e81 45%, #4338ca 68%, #5b21b6 100%);
  background-size: 48px 48px, 48px 48px, auto, auto, auto, auto, auto;
  box-shadow:
    var(--shadow-lg),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(255, 255, 255, 0.06) 50%,
    transparent 60%
  );
  pointer-events: none;
}

.header::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at top left, rgba(255, 255, 255, 0.1) 0%, transparent 45%);
  pointer-events: none;
}

.header-mesh {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.mesh-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(1px);
}

.mesh-orb--1 {
  top: -20%;
  right: 8%;
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.35) 0%, transparent 70%);
  animation: mesh-float 12s ease-in-out infinite;
}

.mesh-orb--2 {
  bottom: -35%;
  right: 25%;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%);
  animation: mesh-float 15s ease-in-out infinite reverse;
}

.mesh-orb--3 {
  top: 10%;
  right: 35%;
  width: 140px;
  height: 140px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: radial-gradient(circle, rgba(255, 255, 255, 0.06) 0%, transparent 70%);
  animation: mesh-float 10s ease-in-out infinite 2s;
}

@keyframes mesh-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-8px, 6px) scale(1.04); }
}

.header-content {
  position: relative;
  z-index: 1;
  max-width: 640px;
}

.header-title {
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  margin: 0 0 0.75rem 0;
  line-height: 1.12;
  color: inherit;
  text-shadow: 0 2px 16px rgba(15, 23, 42, 0.25);
}

.header-subtitle {
  font-size: 1.0625rem;
  opacity: 0.9;
  margin: 0;
  line-height: 1.65;
  font-weight: 400;
  max-width: 52ch;
}

.calculator-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  margin-bottom: 1.75rem;
}

@media (min-width: 768px) {
  .calculator-grid {
    grid-template-columns: 1.15fr 0.85fr;
    align-items: start;
  }
}

.tabs {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.tab-buttons {
  display: flex;
  gap: 4px;
  padding: 6px;
  margin: 1rem 1rem 0;
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  overflow-x: auto;
}

.tab-button {
  flex: 1;
  min-width: fit-content;
  padding: 0.625rem 1.25rem;
  background: transparent;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-muted);
  white-space: nowrap;
  transition: color var(--transition), background var(--transition), box-shadow var(--transition);
}

.tab-button:hover {
  color: var(--color-text);
}

.tab-button.active {
  color: var(--color-text);
  background: var(--color-bg-elevated);
  box-shadow: var(--shadow-sm);
}

.tab-content {
  padding: 1.5rem 1.75rem 1.75rem;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal {
  background: var(--color-bg-elevated);
  padding: 1.75rem;
  border-radius: var(--radius-lg);
  max-width: 480px;
  width: 100%;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
}

.modal h3 {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
}

.modal p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.drop-zone {
  border: 2px dashed var(--color-border-strong);
  border-radius: var(--radius-md);
  padding: 2rem;
  text-align: center;
  margin: 1.25rem 0;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  transition: background var(--transition), border-color var(--transition);
}

.drop-zone:hover,
.drop-zone.drag-over {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.25rem;
}

.rename-input {
  width: 100%;
  margin-top: 1rem;
}

.save-btn {
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, #6366f1 100%);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
}

.cancel-btn {
  padding: 0.625rem 1.25rem;
  background: var(--color-surface-muted);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: background var(--transition);
}

.cancel-btn:hover {
  background: var(--color-border);
}
</style>