<!-- src/components/LoanInputs.vue -->
<template>
    <div class="loan-inputs card">
      <h2 class="card-title">Loan Details</h2>
      <div class="form-grid">
        <div class="form-group">
          <label for="originalLoanAmount">Original Loan Amount (SEK)</label>
          <input 
            type="number" 
            id="originalLoanAmount" 
            v-model.number="localValues.originalLoanAmount"
            @input="handleOriginalLoanChange"
          >
          <div class="tooltip-hint">Initial loan amount when you took the mortgage</div>
        </div>
        
        <div class="form-group">
          <label for="currentLoanAmount">Current Loan Amount (SEK)</label>
          <input 
            type="number" 
            id="currentLoanAmount" 
            v-model.number="localValues.currentLoanAmount"
            @input="handleCurrentLoanChange"
          >
          <div class="tooltip-hint">Your current remaining loan</div>
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
    padding: 1.5rem;
  }
  
  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.125rem;
  }
  
  .form-group {
    margin-bottom: 0;
  }
  </style>