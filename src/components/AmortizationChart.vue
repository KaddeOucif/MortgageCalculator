<template>
  <div class="amortization-tab">
    <div class="info-box">
      <h3>How your loan pays down over time</h3>
      <p>
        The stacked bars show how much you pay in <strong>principal</strong> (green) and
        <strong>interest</strong> (amber) each year. The blue line tracks your
        <strong>remaining loan balance</strong> as it declines over the loan term.
      </p>
      <p class="info-note">
        Based on a {{ formatMoney(values.currentLoanAmount, currency) }} loan at
        {{ values.interestRate }}% interest with a
        {{ results.amortizationRate.toFixed(1) }}% mandatory amortization rate.
      </p>
    </div>

    <div class="summary-stats">
      <div class="stat-card">
        <span class="stat-label">Starting Loan</span>
        <span class="stat-value">{{ formatMoney(values.currentLoanAmount, currency) }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Total Interest</span>
        <span class="stat-value stat-interest">{{ formatMoney(totalInterest, currency) }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Total Principal</span>
        <span class="stat-value stat-principal">{{ formatMoney(totalPrincipal, currency) }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Loan-Free Year</span>
        <span class="stat-value">{{ loanFreeYearLabel }}</span>
      </div>
    </div>

    <div class="chart-container">
      <canvas ref="chart"></canvas>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';
import { formatMoney } from '../utils/formatters';

export default {
  name: 'AmortizationChart',
  props: {
    schedule: {
      type: Array,
      required: true
    },
    values: {
      type: Object,
      required: true
    },
    results: {
      type: Object,
      required: true
    },
    currency: {
      type: String,
      default: 'SEK'
    }
  },
  data() {
    return {
      chart: null
    };
  },
  computed: {
    totalInterest() {
      return this.schedule.reduce((sum, item) => sum + item.yearlyInterest, 0);
    },
    totalPrincipal() {
      return this.schedule.reduce((sum, item) => sum + item.yearlyAmortization, 0);
    },
    loanFreeYearLabel() {
      const paidOff = this.schedule.find(item => item.remainingLoan <= 0);
      if (paidOff) return `Year ${paidOff.year}`;
      const final = this.schedule[this.schedule.length - 1];
      if (final && final.remainingLoan > 0) {
        return `Not within ${final.year} yrs`;
      }
      return `Year ${final?.year ?? 0}`;
    }
  },
  mounted() {
    this.createChart();
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
  methods: {
    formatMoney,
    createChart() {
      const ctx = this.$refs.chart.getContext('2d');
      const currency = this.currency;

      if (this.chart) {
        this.chart.destroy();
      }

      const years = this.schedule.map(item => `Year ${item.year}`);
      const formatAxisValue = (value) => formatMoney(value, currency);

      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: years,
          datasets: [
            {
              type: 'bar',
              label: 'Principal',
              data: this.schedule.map(item => item.yearlyAmortization),
              backgroundColor: '#10b981',
              stack: 'payments',
              yAxisID: 'y',
              order: 2
            },
            {
              type: 'bar',
              label: 'Interest',
              data: this.schedule.map(item => item.yearlyInterest),
              backgroundColor: '#f59e0b',
              stack: 'payments',
              yAxisID: 'y',
              order: 2
            },
            {
              type: 'line',
              label: 'Remaining Balance',
              data: this.schedule.map(item => item.remainingLoan),
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              fill: true,
              tension: 0.1,
              yAxisID: 'y1',
              order: 1,
              pointRadius: 2,
              pointHoverRadius: 5
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            title: {
              display: true,
              text: 'Loan Amortization Schedule',
              font: { size: 16 }
            },
            legend: {
              position: 'top'
            },
            tooltip: {
              callbacks: {
                label(context) {
                  return `${context.dataset.label}: ${formatAxisValue(context.parsed.y)}`;
                },
                footer(tooltipItems) {
                  const principal = tooltipItems.find(i => i.dataset.label === 'Principal');
                  const interest = tooltipItems.find(i => i.dataset.label === 'Interest');
                  if (principal && interest) {
                    const total = principal.parsed.y + interest.parsed.y;
                    return `Annual payment: ${formatAxisValue(total)}`;
                  }
                  return '';
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Year'
              }
            },
            y: {
              stacked: true,
              beginAtZero: true,
              position: 'left',
              title: {
                display: true,
                text: `Annual Payment (${currency})`
              },
              ticks: {
                callback(value) {
                  return formatAxisValue(value);
                }
              }
            },
            y1: {
              beginAtZero: true,
              position: 'right',
              grid: {
                drawOnChartArea: false
              },
              title: {
                display: true,
                text: `Remaining Balance (${currency})`
              },
              ticks: {
                callback(value) {
                  return formatAxisValue(value);
                }
              }
            }
          }
        }
      });
    }
  },
  watch: {
    schedule: {
      handler() {
        this.$nextTick(() => {
          this.createChart();
        });
      },
      deep: true
    },
    currency() {
      this.$nextTick(() => {
        this.createChart();
      });
    }
  }
};
</script>

<style scoped>
.amortization-tab {
  padding: 1rem 0;
}

.info-box {
  background: var(--color-primary-soft);
  border-radius: var(--radius-md);
  padding: 1rem 1.25rem;
  border-left: 4px solid var(--color-primary);
  margin-bottom: 1.25rem;
  border: 1px solid rgba(79, 70, 229, 0.15);
  border-left-width: 4px;
}

.info-box h3 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: #334155;
}

.info-box p {
  margin: 0;
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.5;
}

.info-note {
  margin-top: 0.5rem !important;
  font-size: 0.8125rem !important;
  color: #64748b !important;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.stat-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.875rem 1rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  transition: box-shadow var(--transition);
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
}

.stat-interest {
  color: #d97706;
}

.stat-principal {
  color: #059669;
}

.chart-container {
  height: 450px;
  background: var(--color-bg-elevated);
  padding: 1.25rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
}
</style>
