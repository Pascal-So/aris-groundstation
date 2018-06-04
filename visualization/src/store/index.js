import Vue from 'vue';
import Vuex from 'vuex';
import { EventBus } from './../event-bus';
import Config from './../config';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    data: [],
    duration: null,
  },
  getters: {
    storedDataRange: state => {
        if(state.data.length == 0){
            return null;
        }

        const start = state.data[0].time;
        const end = state.data[state.data.length - 1].time;

        return {
            start: start,
            end: end,
        };
    },
    graphFormattedData: state => {
        const altitude = state.data.map(frame => {
            return {
                x: frame.time / 1000,
                y: frame.pos.z,
            };
        });

        const velocity_z = state.data.map(frame => {
            return {
                x: frame.time / 1000,
                y: frame.vel.z,
            };
        });

        return {
            altitude: altitude,
            velocity_z: velocity_z,
        };
    },
  },
  mutations: {
    merge (state, res) {
        state.duration = res.info.flight_data_duration;
        const new_data = res.data;

        if(new_data.length == 0){
            return;
        }

        const new_data_start_time = new_data[0].time;

        // vuex does not allow access to getters in mutations..  -.-
        if(state.data.length != 0 && 
            new_data_start_time >= state.data[0].time && 
            new_data_start_time <= state.data[state.data.length - 1].time + Config.data_frame_interval){
            const append_data = new_data.filter(frame => {
                return frame.time > state.data[state.data.length - 1].time;
            });
            state.data = state.data.concat(append_data);
        }else{
            state.data = new_data;
            // reset views, e.g. clear trajectory line in 3d viz, because we'd have a jump otherwise
            EventBus.$emit('reset-views');
        }
    }
  }
});