<script>
import { Line, mixins } from 'vue-chartjs'

const tickColor = 'rgb(220, 220, 240)';
const lineColor = 'rgb(110, 110, 110)';

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
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
  elements: {
    point: {
      radius: 0,
      hitRadius: 5,
      hoverRadius: 5
    }
  }
}

export default Line.extend({
  mixins: [mixins.reactiveProp],
  props: ['options', 'chartData'],
  mounted () {
    console.log(this.options, 'options');
    this.renderChart(this.chartData, defaultOptions)
  }
})
</script>
