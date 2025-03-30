// src/services/storageService.js
export function saveCalculatorValues(values) {
    localStorage.setItem('mortgageCalculator', JSON.stringify(values));
  }
  
  export function loadCalculatorValues() {
    const saved = localStorage.getItem('mortgageCalculator');
    return saved ? JSON.parse(saved) : null;
  }
  
  export function getSavedCalculations() {
    const saved = localStorage.getItem('savedCalculations');
    return saved ? JSON.parse(saved) : [];
  }
  
  export function saveCalculation(calculation) {
    const savedCalculations = getSavedCalculations();
    savedCalculations.push(calculation);
    localStorage.setItem('savedCalculations', JSON.stringify(savedCalculations));
    return calculation;
  }
  
  export function deleteCalculation(id) {
    const savedCalculations = getSavedCalculations();
    const updated = savedCalculations.filter(calc => calc.id !== id);
    localStorage.setItem('savedCalculations', JSON.stringify(updated));
  }
  
  export function updateCalculation(updatedCalculation) {
    const savedCalculations = getSavedCalculations();
    const updated = savedCalculations.map(calc => {
      if (calc.id === updatedCalculation.id) {
        return updatedCalculation;
      }
      return calc;
    });
    localStorage.setItem('savedCalculations', JSON.stringify(updated));
  }