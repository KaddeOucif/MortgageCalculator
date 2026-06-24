<!-- src/components/LoanInputs.vue -->
<template>
    <div class="loan-inputs card">
      <h2 class="card-title">Loan Details</h2>
      <div class="form-grid">
        <div class="form-group">
          <label for="originalLoanAmount">Original Loan Amount ({{ currency }})</label>
          <input 
            type="number" 
            id="originalLoanAmount" 
            v-model.number="localValues.originalLoanAmount"
            @input="handleOriginalLoanChange"
          >
          <div class="tooltip-hint">Initial loan amount when you took the mortgage</div>
        </div>
        
        <div class="form-group">
          <label for="currentLoanAmount">Current Loan Amount ({{ currency }})</label>
          <input 
            type="number" 
            id="currentLoanAmount" 
            v-model.number="localValues.currentLoanAmount"
            @input="handleCurrentLoanChange"
          >
          <div class="tooltip-hint">Your current remaining loan</div>
        </div>
        
        <div class="form-group">
          <label for="propertyValue">Property Value ({{ currency }})</label>
          <input 
            type="number" 
            id="propertyValue" 
            v-model.number="localValues.propertyValue"
            @input="emitUpdate"
          >
        </div>
        
        <div class="form-group">
          <label for="annualIncome">Annual Income ({{ currency }})</label>
          <input 
            type="number" 
            id="annualIncome" 
            v-model.number="localValues.annualIncome"
            @input="emitUpdate"
          >
        </div>
        
        <div class="form-group">
          <label for="interestRate">Interest Rate (%)</label>
          <input 
            type="number" 
            id="interestRate" 
            v-model.number="localValues.interestRate"
            step="0.01"
            @input="emitUpdate"
          >
        </div>
        
        <div class="form-group">
          <label for="loanTermYears">Loan Term (Years)</label>
          <input 
            type="number" 
            id="loanTermYears" 
            v-model.number="localValues.loanTermYears"
            @input="emitUpdate"
          >
        </div>
        
        <div class="form-group">
          <label for="brfFee">Brf Fee ({{ currency }}/month)</label>
          <input 
            type="number" 
            id="brfFee" 
            v-model.number="localValues.brfFee"
            @input="emitUpdate"
          >
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'LoanInputs',
    props: {
      values: {
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
        localValues: { ...this.values }
      };
    },
    watch: {
      values: {
        handler(newValues) {
          this.localValues = { ...newValues };
        },
        deep: true
      }
    },
    methods: {
      handleOriginalLoanChange() {
        if (this.localValues.currentLoanAmount > this.localValues.originalLoanAmount) {
          this.localValues.currentLoanAmount = this.localValues.originalLoanAmount;
        }
        this.emitUpdate();
      },
      handleCurrentLoanChange() {
        if (this.localValues.currentLoanAmount > this.localValues.originalLoanAmount) {
          this.localValues.currentLoanAmount = this.localValues.originalLoanAmount;
        }
        this.emitUpdate();
      },
      emitUpdate() {
        this.$emit('update', { ...this.localValues });
      }
    }
  };
  </script>
  
  <style scoped>
  .loan-inputs {
    padding: 1.5rem;
    border-top: 4px solid transparent;
    border-image: linear-gradient(90deg, var(--color-primary), var(--color-accent), var(--color-violet)) 1;
  }
  
  .form-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  @media (min-width: 640px) {
    .form-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  label {
    font-weight: 500;
    font-size: 0.875rem;
  }
  
  input {
    padding: 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
  }
  
  .tooltip-hint {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }
  </style>
