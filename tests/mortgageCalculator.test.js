import { describe, it, expect } from 'vitest';
import { calculateMortgage } from '../src/calculations/mortgageCalculator.js';

// Validates calculateMortgage baseline scenarios and LTV edge cases.
describe('calculateMortgage', () => {
  const defaultInputs = [
    2_000_000, // originalLoanAmount
    2_000_000, // currentLoanAmount
    3_000_000, // propertyValue
    500_000,   // annualIncome
    3.5,       // interestRate
    30         // loanTermYears
  ];

  it('returns baseline monthly payment for default Swedish LTV scenario', () => {
    const result = calculateMortgage(...defaultInputs);

    expect(result.monthlyAmortization).toBeCloseTo(1666.67, 1);
    expect(result.monthlyInterest).toBeCloseTo(5833.33, 1);
    expect(result.totalMonthlyPayment).toBeCloseTo(7500, 0);
    expect(result.amortizationRate).toBe(1);
  });

  it('applies 2% amortization when LTV exceeds 70%', () => {
    const result = calculateMortgage(3_000_000, 3_000_000, 3_000_000, 10_000_000, 3.5, 30);

    expect(result.amortizationRate).toBe(2);
    expect(result.monthlyAmortization).toBeCloseTo(5000, 0);
  });

  it('adds 1% amortization when debt-to-income exceeds 450%', () => {
    const result = calculateMortgage(2_000_000, 2_000_000, 3_000_000, 400_000, 3.5, 30);

    expect(result.amortizationRate).toBe(2);
  });

  it('includes a 30-year amortization schedule', () => {
    const result = calculateMortgage(...defaultInputs);

    expect(result.schedule).toHaveLength(30);
    expect(result.schedule[0].year).toBe(1);
    expect(result.loanPercentage).toBe(100);
  });

  it('evaluates affordability against stress-tested payment', () => {
    const result = calculateMortgage(...defaultInputs);

    expect(result.stressTestMonthlyPayment).toBeGreaterThan(result.totalMonthlyPayment);
    expect(typeof result.isAffordable).toBe('boolean');
  });
});
