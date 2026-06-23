// src/utils/formatters.js
export function formatCurrency(amount) {
    return new Intl.NumberFormat('sv-SE').format(Math.round(amount));
  }
  
  export function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
  }

  export function formatPayoffDate(monthsFromNow) {
    const date = new Date();
    date.setMonth(date.getMonth() + monthsFromNow);
    return date.toLocaleDateString('sv-SE', { year: 'numeric', month: 'long' });
  }