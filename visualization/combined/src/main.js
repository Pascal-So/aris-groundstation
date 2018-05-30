// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import PlaybackController from './playback-controller';

Vue.config.productionTip = false;

// utils
Vue.mixin({
    methods: {
        renderTime: time => {
            const rounded = time.toFixed(3);

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
  components: { App },
  template: '<App/>'
});

const controller = new PlaybackController();