<template>
  <div class="flight-selection">
    <h1>Select a flight</h1>
    <p v-if="status == 'loading'">loading...</p>
    <p v-if="status == 'error'">Network error. pls fix then reload.</p>
    <ul v-if="status == 'ok'">
      <li v-for="flight in flights" class="flight">
        <router-link :to="{name: 'Overview', params: {database: flight} }">{{ flight }}</router-link>
      </li>
    </ul>
  </div>
</template>

<script>

import Config from '../config';

export default {
  name: 'FlightSelection',
  data () {
    return {
      status: 'loading',
      flights: [
      ],
    }
  },
  mounted() {
    const url = Config.fetch_url + '/get-databases';
    fetch(url)
      .then(res => res.json())
      .then(res => {
        this.status = 'ok';
        this.flights = res.databases;
      })
      .catch(err => {
        console.log("Network error:", err);
        this.status = 'error';
      });
  }
}
</script>

<style scoped>
  ul{
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
  .flight{
    background-color: #1D1C1F;
    margin: 10px 0;
    padding: 5px 10px;
  }

  .flight a {
    color: #ddd;
    font-size: 1.2rem;
    text-decoration: none;
    text-decoration-line: 1px;
  }
</style>
