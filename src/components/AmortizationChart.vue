<template>
  <div class="amortization-tab">
    <div class="chart-container">
      <canvas ref="chart"></canvas>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  name: 'AmortizationChart',
  props: {
    schedule: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      chart: null
    };
  },
  mounted() {
    this.createChart();
  },
  methods: {
    createChart() {
      const ctx = this.$refs.chart.getContext('2d');
      
      if (this.chart) {
        this.chart.destroy();
      }
      
      const years = this.schedule.map(item => `Year ${item.year}`);
      const remainingLoan = this.schedule.map(item => item.remainingLoan);
      
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: years,
          datasets: [{
            label: 'Remaining Loan',
            data: remainingLoan,
            borderColor: '#0f172a',
            backgroundColor: 'rgba(15, 23, 42, 0.1)',
            fill: true,
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Loan Amortization Schedule'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return value.toLocaleString('sv-SE') + ' SEK';
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
    }
  }
};
</script>

<style scoped>
.amortization-tab {
  padding: 1rem 0;
}

.chart-container {
  height: 400px;
  background: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
