// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import store from './store'
import App from './App';
import router from './router';
import PlaybackController from './playback-controller';

Vue.config.productionTip = false;

// utils
Vue.mixin({
  methods: {
    renderTime: time => {
      // time in ms
      if(isNaN(time)){
        return 'T+??s';
      }

      const rounded = (time / 1000).toFixed(1);

      if (time >= 0) {
        return `T+${rounded}s`;
      }else{
        return `T${rounded}s`;
      }
    }
  }
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
});

const controller = new PlaybackController();