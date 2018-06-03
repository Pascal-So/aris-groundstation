<template>
  <div class="graph">
    <h3>{{ title }}</h3>
    <canvas></canvas>
  </div>
</template>

<script>

import Chart from 'chart.js';
import moment from 'moment';
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
          data: this.allData,
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
              suggestedMax: 50
            }
          }],
          xAxes: [{
            type: 'linear',
            gridLines: {
              color: lineColor,
            },
            ticks: {
              fontColor: tickColor,
              suggestedMin: 0,
              suggestedMax: 1
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
</style>
