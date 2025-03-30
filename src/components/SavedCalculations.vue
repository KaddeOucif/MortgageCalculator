<template>
  <div class="saved-tab">
    <div class="saved-calculations">
      <h3>Saved Calculations</h3>
      <button @click="$emit('import')" class="import-btn">
        Import Calculation
      </button>
      
      <div v-if="savedCalculations.length === 0" class="no-saved">
        No saved calculations yet.
      </div>
      
      <div v-else class="saved-list">
        <div 
          v-for="calc in savedCalculations" 
          :key="calc.id"
          class="saved-item"
          @click="$emit('load', calc)"
        >
          <div class="saved-title">{{ calc.name }}</div>
          <div class="saved-details">
            <div>Loan: {{ formatCurrency(calc.currentLoanAmount) }} SEK</div>
            <div>Monthly: {{ formatCurrency(calc.monthlyPayment) }} SEK</div>
          </div>
          <div class="saved-actions">
            <button @click.stop="$emit('rename', calc)" class="action-btn">✏️</button>
            <button @click.stop="$emit('export', calc)" class="action-btn">💾</button>
            <button @click.stop="$emit('delete', calc.id)" class="action-btn">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatCurrency } from '../utils/formatters';
import { getSavedCalculations } from '../services/storageServices';

export default {
  name: 'SavedCalculations',
  data() {
    return {
      savedCalculations: []
    };
  },
  created() {
    this.loadSavedCalculations();
  },
  methods: {
    formatCurrency,
    loadSavedCalculations() {
      this.savedCalculations = getSavedCalculations();
    }
  }
};
</script>

<style scoped>
.saved-tab {
  padding: 1rem 0;
}

.saved-calculations {
  display: flex;
  flex-direction: column;
}

.import-btn {
  align-self: flex-end;
  padding: 0.5rem 1rem;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 1rem;
}

.no-saved {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}

.saved-list {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
}

@media (min-width: 640px) {
  .saved-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

.saved-item {
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.saved-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.saved-title {
  padding: 0.75rem;
  font-weight: 600;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.saved-details {
  padding: 0.75rem;
  font-size: 0.875rem;
}

.saved-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  margin-left: 0.5rem;
  font-size: 1rem;
}
</style>
