// src/utils/constants.js
export const AMORTIZATION_RULES = {
    HIGH_LTV: {
      threshold: 0.7,
      rate: 0.02 // 2% per year
    },
    MEDIUM_LTV: {
      threshold: 0.5,
      rate: 0.01 // 1% per year
    },
    LOW_LTV: {
      threshold: 0,
      rate: 0
    }
  };
  
  export const DEBT_TO_INCOME_LIMIT = 4.5; // 450% of gross income
  export const STRESS_TEST_RATE_INCREASE = 3; // 3 percentage points higher
  export const MIN_INTEREST_RATE = 6; // Minimum rate for stress test