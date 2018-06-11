<template>
  <div class="eventlist">
    <h3>Events</h3>
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
          message: 'Example event: State transition',
          severity: 5,
          time: 1.2,
        }
      ]
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

  h3{
    padding: 0 5px;
  }

  .eventlist{
    padding: 0 10px;
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
