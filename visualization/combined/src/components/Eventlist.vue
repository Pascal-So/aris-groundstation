<template>
  <div class="eventlist">
    <ul>
      <li v-for="event in events" class="event">
        <p>{{ renderTime(event.time) }}</p>
        <h2>{{ event.message }}</h2>
      </li>
    </ul>
  </div>
</template>

<script>

export default {
  name: 'Eventlist',
  data () {
    return {
      events: [
        {
          message: 'All Systems OK',
          severity: 6,
          time: -1.35
        },
        {
          message: 'LAUNCH',
          severity: 5,
          time: 0
        },
        {
          message: 'U fuekd up',
          severity: 5,
          time: 12.89
        }
      ]
    }
  },
  methods: {
    renderTime(time){
      const rounded = time.toFixed(3);

      if (time >= 0) {
        return `T+${rounded}s`;
      }else{
        return `T${rounded}s`;
      }
    }
  }
}
</script>

<style scoped>
  ul{
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
  .event{
    background-color: #1D1C1F;
    margin: 10px 0;
    padding: 5px 10px;
  }

  .event p, .event h2{
    margin: 5px 0;
  }
</style>
