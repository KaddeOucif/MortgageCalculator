<!-- src/components/LoanInputs.vue -->
<template>
    <div class="loan-inputs">
      <h2>Loan Details</h2>
      <div class="form-grid">
        <div class="form-group">
          <label for="originalLoanAmount">Original Loan Amount (SEK)</label>
          <input 
            type="number" 
            id="originalLoanAmount" 
            v-model.number="localValues.originalLoanAmount"
            @input="handleOriginalLoanChange"
          >
          <div class="tooltip">Initial loan amount when you took the mortgage</div>
        </div>
        
        <div class="form-group">
          <label for="currentLoanAmount">Current Loan Amount (SEK)</label>
          <input 
            type="number" 
            id="currentLoanAmount" 
            v-model.number="localValues.currentLoanAmount"
            @input="handleCurrentLoanChange"
          >
          <div class="tooltip">Your current remaining loan</div>
        </div>
        
        <div class="form-group">
          <label for="propertyValue">Property Value (SEK)</label>
          <input 
            type="number" 
            id="propertyValue" 
            v-model.number="localValues.propertyValue"
            @input="emitUpdate"
          >
        </div>
        
        <div class="form-group">
          <label for="annualIncome">Annual Income (SEK)</label>
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
          <label for="brfFee">Brf Fee (SEK/month)</label>
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
        // Ensure current loan doesn't exceed original loan
        if (this.localValues.currentLoanAmount > this.localValues.originalLoanAmount) {
          this.localValues.currentLoanAmount = this.localValues.originalLoanAmount;
        }
        this.emitUpdate();
      },
      handleCurrentLoanChange() {
        // Ensure current loan doesn't exceed original loan
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
    background: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
  }
  </style>