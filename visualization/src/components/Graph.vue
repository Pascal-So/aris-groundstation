<template>
  <div class="graph">
    <h3>{{ title }}</h3>
    <div class="heigh-limiter">
      <canvas></canvas>
    </div>
  </div>
</template>

<script>

import Chart from 'chart.js/dist/Chart.js';
import { mapState, mapGetters } from 'vuex';

const tickColor = 'rgb(220, 220, 240)';
const lineColor = 'rgb(110, 110, 110)';

export default {
  name: 'Graph',
  props: [
    'title',
    'dataset',
  ],
  data () {
    return {
      ctx: null,
      chart: null,
    }
  },
  computed: {
    ...mapGetters({
      graph_formatted_data: 'graphFormattedData',
    }),
  },
  watch: {
    graph_formatted_data: function(val){
      if(!this.chart) return;

      this.chart.data.datasets[0].data = val[this.dataset];
      this.chart.update();
    },
  },
  mounted() {
    this.ctx = this.$el.querySelector('canvas').getContext('2d');
    this.chart = new Chart(this.ctx, {
      type: 'line',
      data: {
        datasets: [{
          data: [],
          borderColor: 'rgb(141, 185, 224)',
          lineTension: 0,
          fill: true,
          backgroundColor: 'rgba(0,5,10,0.3)',
        }]
      },
      options: {
        legend: {
          display: false,
        },
        animation: false,
        scales: {
          yAxes: [{
            gridLines: {
              color: lineColor,
            },
            ticks: {
              fontColor: tickColor,
              suggestedMin: 0,
              suggestedMax: 1,
            }
          }],
          xAxes: [{
            type: 'linear',
            gridLines: {
              color: lineColor,
            },
            ticks: {
              fontColor: tickColor,
            }
          }]
        },
        tooltips: {
          callbacks: {
            label(tooltipItem, data) {
              const roundingFactor = 1000;
              const rounded = Math.floor(tooltipItem.yLabel * roundingFactor) / roundingFactor;
              return ' ' + rounded;
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          point: {
            radius: 0,
            hitRadius: 5,
            hoverRadius: 5
          }
        }
      }
    });
  }
}
</script>

<style scoped>
  h1{
    color: #ddd;
  }

  h3{
    padding: 0 10px;
    margin: 5px 0;
  }

  .graph{
    padding: 5px 5px;
  }

  .heigh-limiter{
    height: 260px;
  }
</style>
