<template>
  <div id="status">
  </div>
</template>

<script>

import { EventBus } from '../event-bus.js';

export default {
  name: 'Status',
  data () {
    return {
    };
  },
  mounted () {
    EventBus.$on('reset-views', this.reset);
  },
  computed: {
    ...mapState({
      events: state => state.events,
    }),
  },
  methods: {
    reset () {
      //this.events = [];
    },
  }
}
</script>

<style scoped>
  
</style>
