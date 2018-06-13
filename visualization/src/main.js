// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import store from './store'
import App from './App';
import router from './router';

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
    },

    prettyFlightName: db_name => {
      if(db_name.match(/^flight-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}$/)){
        return db_name.replace(/^flight-(\d{4}-\d{2}-\d{2})-(\d{2})-(\d{2})-(\d{2})$/, "Flight $1, $2:$3:$4");
      }

      return db_name[0].toUpperCase() + db_name.substr(1);
    },
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
