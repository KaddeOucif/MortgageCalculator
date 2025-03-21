// src/calculations/timeToPayoff.js
export function calculateTimeToPayoff(loanAmount, monthlyPayment, interestRate, extraOneTimePayment = 0) {
    const monthlyRate = interestRate / 12 / 100;
    let balance = loanAmount - extraOneTimePayment;
    let months = 0;
    
    // If payment is too small to cover interest, it will never be paid off
    if (monthlyPayment <= balance * monthlyRate) {
      return {
        years: 99,
        months: 0,
        finalBalance: balance
      };
    }
    
    while (balance > 0 && months < 1200) { // 100 years max
      const interestThisMonth = balance * monthlyRate;
      const principalThisMonth = Math.min(balance, monthlyPayment - interestThisMonth);
      
      balance -= principalThisMonth;
      months++;
      
      // Break if we're close enough to zero to avoid floating point issues
      if (balance < 1) {
        balance = 0;
        break;
      }
    }
    
    return {
      years: Math.floor(months / 12),
      months: months % 12,
      finalBalance: balance
    };
  }