// src/calculations/amortizationSchedule.js
export function calculateAmortizationSchedule(initialLoan, interestRate, amortizationRate, years) {
    let remainingLoan = initialLoan;
    const schedule = [];
    
    for (let year = 1; year <= years; year++) {
      const yearlyAmortization = remainingLoan * amortizationRate;
      const yearlyInterest = remainingLoan * (interestRate / 100);
      remainingLoan -= yearlyAmortization;
      
      schedule.push({
        year,
        remainingLoan,
        yearlyAmortization,
        yearlyInterest,
        totalPayment: yearlyAmortization + yearlyInterest
      });
    }
    
    return schedule;
  }