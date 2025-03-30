/**
 * Calculate comparison scenarios between paying extra on mortgage vs investing in stock market
 */
export function calculateComparisonScenarios(scenarios, currentLoanAmount, interestRate, expectedReturn, accountType) {
  return scenarios.map(scenario => {
    // Get the extra payment amount
    const extraPayment = scenario.extra;
    const basePayment = scenario.monthlyPayment - extraPayment;
    
    // Calculate mortgage strategy (paying extra on mortgage)
    const mortgageStrategy = {
      interestSaved: scenario.interestSaved,
      monthsSaved: scenario.monthsSaved,
      timeToPayoff: scenario.timeToPayoff,
      // Property value after mortgage is paid off
      netWorth: currentLoanAmount
    };
    
    // Calculate investment strategy (investing the extra payment)
    const monthlyInvestment = extraPayment;
    const years = scenario.timeToPayoff.years;
    const months = scenario.timeToPayoff.months;
    const totalMonths = years * 12 + months;
    
    // Calculate investment growth
    const monthlyReturnRate = (1 + expectedReturn / 100) ** (1/12) - 1;
    
    // Track investment value over time for ISK tax calculation
    let investmentValue = 0;
    let totalTaxPaid = 0;
    let totalInvested = 0;
    let afterTaxValue = 0;
    
    // Define investmentStrategy object outside the if/else blocks
    let investmentStrategy = {};
    
    // For ISK accounts, we need to calculate tax yearly on the account value
    if (accountType === 'isk') {
      // ISK tax rate is currently about 0.375% of account value annually (1.25% * 30%)
      const annualIskTaxRate = 0.00375;
      
      for (let month = 1; month <= totalMonths; month++) {
        // Add monthly investment and growth
        investmentValue = (investmentValue * (1 + monthlyReturnRate)) + monthlyInvestment;
        
        // Apply ISK tax at the end of each year
        if (month % 12 === 0) {
          const yearlyTax = investmentValue * annualIskTaxRate;
          totalTaxPaid += yearlyTax;
          // Tax is paid separately, not deducted from the account
        }
      }
      
      totalInvested = monthlyInvestment * totalMonths;
      afterTaxValue = investmentValue; // ISK tax is paid separately
      
      investmentStrategy = {
        finalValue: investmentValue,
        totalInvested: totalInvested,
        iskTaxPaid: totalTaxPaid,
        afterTaxValue: afterTaxValue,
        netWorth: afterTaxValue // Property value and mortgage cancel out
      };
    } else {
      // Standard account with 30% capital gains tax
      for (let i = 0; i < totalMonths; i++) {
        investmentValue = (investmentValue * (1 + monthlyReturnRate)) + monthlyInvestment;
      }
      
      totalInvested = monthlyInvestment * totalMonths;
      const capitalGains = Math.max(0, investmentValue - totalInvested);
      const taxAmount = capitalGains * 0.3; // 30% capital gains tax
      afterTaxValue = investmentValue - taxAmount;
      
      investmentStrategy = {
        finalValue: investmentValue,
        totalInvested: totalInvested,
        capitalGains: capitalGains,
        taxAmount: taxAmount,
        afterTaxValue: afterTaxValue,
        netWorth: afterTaxValue // Property value and mortgage cancel out
      };
    }
    
    // Determine which strategy is better
    let winner, winnerText, winnerDescription;
    const mortgageNetWorth = mortgageStrategy.netWorth;
    const investmentNetWorth = investmentStrategy.netWorth;
    
    if (mortgageNetWorth > investmentNetWorth * 1.05) {
      winner = 'mortgage';
      winnerText = 'Mortgage Wins';
      winnerDescription = `Better by ${((mortgageNetWorth / investmentNetWorth - 1) * 100).toFixed(1)}%`;
    } else if (investmentNetWorth > mortgageNetWorth * 1.05) {
      winner = 'investment';
      winnerText = 'Investment Wins';
      winnerDescription = `Better by ${((investmentNetWorth / mortgageNetWorth - 1) * 100).toFixed(1)}%`;
    } else {
      winner = 'tie';
      winnerText = 'It\'s a Tie';
      winnerDescription = 'Both strategies are similar';
    }
    
    // Calculate percentages for chart
    const max = Math.max(mortgageNetWorth, investmentNetWorth);
    const mortgagePercentage = (mortgageNetWorth / max) * 100;
    const investmentPercentage = (investmentNetWorth / max) * 100;
    
    // Generate analysis text
    let analysis = '';
    if (winner === 'mortgage') {
      analysis = `Paying an extra ${extraPayment} SEK per month on your mortgage would save you ${mortgageStrategy.interestSaved.toFixed(0)} SEK in interest and help you pay off your mortgage ${formatTimeSaved(mortgageStrategy.monthsSaved)} earlier. This strategy outperforms investing in the stock market by ${((mortgageNetWorth / investmentNetWorth - 1) * 100).toFixed(1)}% given the current interest rate and expected stock market returns.`;
    } else if (winner === 'investment') {
      analysis = `Investing ${extraPayment} SEK per month in the stock market while making minimum mortgage payments would likely result in a higher net worth after ${years} years. The investment strategy outperforms the mortgage payoff strategy by ${((investmentNetWorth / mortgageNetWorth - 1) * 100).toFixed(1)}% assuming a ${expectedReturn}% annual return.`;
    } else {
      analysis = `Both strategies yield similar results after ${years} years. Paying extra on your mortgage offers guaranteed savings on interest, while investing offers potential for higher returns but with more risk. Consider your risk tolerance and financial goals when deciding.`;
    }
    
    return {
      ...scenario,
      mortgageStrategy,
      investmentStrategy,
      winner,
      winnerText,
      winnerDescription,
      mortgagePercentage,
      investmentPercentage,
      analysis
    };
  });
}

function formatTimeSaved(months) {
  const absoluteMonths = Math.abs(months);
  const years = Math.floor(absoluteMonths / 12);
  const remainingMonths = absoluteMonths % 12;
  
  return `${years} years and ${remainingMonths} months`;
} 