// src/services/storageService.js
export function saveCalculatorValues(values, currency = 'SEK') {
  localStorage.setItem('mortgageCalculator', JSON.stringify({ ...values, currency }));
}

export function loadCalculatorValues() {
  const saved = localStorage.getItem('mortgageCalculator');
  if (!saved) {
    return null;
  }

  const parsed = JSON.parse(saved);
  const { currency = 'SEK', ...values } = parsed;
  return { values, currency };
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
