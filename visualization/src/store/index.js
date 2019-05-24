import Vue from 'vue';
import Vuex from 'vuex';
import { EventBus } from './../event-bus';
import Config from './../config';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        data: [],
        events: [
            // {
            //     id: 10,
            //     param1: 3,
            //     param2: 1,
            //     time: 200,
            // },
            // {
            //     id: 10,
            //     param1: 5
            //     param2: 3,
            //     time: 2350,
            // },
        ],
        duration: null,

        // note: this copy of the playback_time is only used for filtering the
        // graph display. the one true source of truth for the playback time is
        // still playback-controller.js.
        playback_time: 0,
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
        events: state => {
            return state.events;
        },
        graphFormattedData: state => {
            const filtered = state.data.filter(frame => frame.time <= state.playback_time);

            const y_non_null = frame => frame.y !== null;

            const fusion_alt = filtered.map(frame => {
                return {
                    x: frame.time / 1000,
                    y: frame.fusion.alt,
                };
            }).filter(y_non_null);

            const fusion_vel = filtered.map(frame => {
                return {
                    x: frame.time / 1000,
                    y: frame.fusion.vel,
                };
            }).filter(y_non_null);

            const bar1_temp = filtered.map(frame => {
                return {
                    x: frame.time / 1000,
                    y: frame.bar1.temp,
                };
            }).filter(y_non_null);

            const brk_u = filtered.map(frame => {
                return {
                    x: frame.time / 1000,
                    y: frame.brk.u,
                };
            }).filter(y_non_null);

            const acceleration = filtered.map(frame => {
                const sq = frame.acc1.x * frame.acc1.x + frame.acc1.y * frame.acc1.y + frame.acc1.z * frame.acc1.z;

                return {
                    x: frame.time / 1000,
                    y: (frame.acc1.x === null) ? null : Math.sqrt(sq),
                };
            }).filter(y_non_null);

            return {
                acceleration: acceleration,
                fusion_vel: fusion_vel,
                fusion_alt: fusion_alt,
                bar1_temp: bar1_temp,
                brk_u: brk_u,
            };
        },
    },
    mutations: {
        merge (state, received_data) {
            state.duration = received_data.info.flight_data_duration;
            const new_data = received_data.data;
            const new_events = received_data.events;

            if(new_data.length == 0){
                return;
            }

            const new_data_start_time = new_data[0].time;

            // vuex does not allow access to getters in mutations..  -.-
            if(state.data.length != 0 &&
                new_data_start_time >= state.data[0].time &&
                new_data_start_time <= state.data[state.data.length - 1].time + Config.data_time_resolution){
                const append_data = new_data.filter(frame => {
                    return frame.time > state.data[state.data.length - 1].time;
                });
                const append_events = new_events.filter(frame => {
                    return frame.time > state.data[state.data.length - 1].time;
                });

                state.data = state.data.concat(append_data);
                state.events = state.events.concat(append_events);
            }else{
                state.data = new_data;
                state.events = new_events;

                // reset views, e.g. clear trajectory line in 3d viz, because we'd have a jump otherwise
                EventBus.$emit('reset-views');
            }
        },
        setPlaybackTime (state, new_time) {
            state.playback_time = new_time;
        },
        clear (state) {
            state.data = [];
            state.duration = null;
        }
    }
});