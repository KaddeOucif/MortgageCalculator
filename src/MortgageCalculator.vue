<template>
  <div class="mortgage-calculator">
    <div class="header">
      <div class="header-content">
        <div class="header-badge">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 22h20"></path>
            <path d="M3 9l9-7 9 7v13H3V9z"></path>
            <path d="M9 22V12h6v10"></path>
          </svg>
          Mortgage
        </div>
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
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: white;
  padding: 2rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.header-content {
  max-width: 800px;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.header-badge svg {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
}

.header-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.header-subtitle {
  font-size: 1.125rem;
  opacity: 0.8;
  margin: 0;
}

.calculator-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .calculator-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.tabs {
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tab-buttons {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
}

.tab-button {
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: #64748b;
  white-space: nowrap;
}

.tab-button.active {
  color: #0f172a;
  box-shadow: inset 0 -2px 0 #0f172a;
}

.tab-content {
  padding: 1.5rem;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  max-width: 500px;
  width: 100%;
}

.drop-zone {
  border: 2px dashed #e2e8f0;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  margin: 1rem 0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.drop-zone.drag-over {
  background-color: #f8fafc;
  border-color: #0f172a;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.rename-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  margin-top: 1rem;
}

.save-btn {
  padding: 0.5rem 1rem;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 500;
  margin-right: 0.5rem;
}

.cancel-btn {
  padding: 0.5rem 1rem;
  background: #e2e8f0;
  color: #0f172a;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 500;
}

.cancel-btn:hover {
  background: #cbd5e1;
}
</style>