// src/utils/formatters.js
export function formatCurrency(amount) {
    return new Intl.NumberFormat('sv-SE').format(Math.round(amount));
  }
  
  export function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
  }