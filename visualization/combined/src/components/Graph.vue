<template>
  <div class="graph">
    <h3>{{ title }}</h3>
    <canvas></canvas>
  </div>
</template>

<script>

import Chart from 'chart.js';
import moment from 'moment';

const tickColor = 'rgb(220, 220, 240)';
const lineColor = 'rgb(110, 110, 110)';

export default {
  name: 'Graph',
  props: [
    'title'
  ],
  data () {
    return {
      values: [],
      ctx: null,
      chart: null,
      allData: [
        {x: 0.005279, y: 0.001646189},
        {x: 0.035572, y: 0.001104113},
        {x: 0.042687, y: 0.005967639},
        {x: 0.048275, y: 0.01248674},
        {x: 0.054001, y: 0.02098171},
        {x: 0.059685, y: 0.03152591},
        {x: 0.065285, y: 1.08041411},
        {x: 0.072222, y: 1.1085928},
        {x: 0.077963, y: 1.1370033},
        {x: 0.083656, y: 1.1844269},
        {x: 0.08932, y: 1.2205278},
        {x: 0.094979, y: 1.2683234},
        {x: 0.094979, y: 1.2683234},
        {x: 0.594979, y: 25.2683234},
      ]
    }
  },
  methods: {
    addData() {
      var i = this.chart.data.datasets[0].data.length + 1;
      if (i < this.allData.length) {
        this.chart.data.datasets[0].data.push(this.allData[i]);
      }
      this.chart.update();
    }
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

    //setInterval(this.addData, 100);
  }
}
</script>

<style scoped>
  h1{
    color: #ddd;
  }
</style>
