import { describe, it, expect } from 'vitest';
import { calculateAmortizationSchedule } from '../src/calculations/amortizationSchedule.js';

describe('calculateAmortizationSchedule', () => {
  it('computes year-one principal, interest, and remaining balance', () => {
    const schedule = calculateAmortizationSchedule(2_000_000, 3.5, 0.01, 30);

    expect(schedule).toHaveLength(30);
    expect(schedule[0]).toMatchObject({
      year: 1,
      yearlyAmortization: 20_000,
      yearlyInterest: 70_000,
      remainingLoan: 1_980_000,
      totalPayment: 90_000
    });
  });

  it('reduces remaining loan each year', () => {
    const schedule = calculateAmortizationSchedule(1_000_000, 4, 0.02, 10);

    for (let i = 1; i < schedule.length; i++) {
      expect(schedule[i].remainingLoan).toBeLessThan(schedule[i - 1].remainingLoan);
    }
  });
});
