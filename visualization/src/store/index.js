import Vue from 'vue';
import Vuex from 'vuex';
import { EventBus } from './../event-bus';
import Config from './../config';
import utils from './../utils';

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
        // Stored in milliseconds.
        playback_time: 0,

        // These keep the gps with the biggest timestamp seen, even after a complete
        // view reset. If no gps data is currently available in the stored data,
        // then this value is displayed.
        last_seen_gps1: {
            coords: null,
            time: null,
        },
        last_seen_gps2: {
            coords: null,
            time: null,
        },
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
        status: state => {
            let status = {
                temp: null,
                gps1: null,
                gps2: null,
                state: null,
            }

            for (const frame of state.data) {
                if (frame.time > state.playback_time)
                    break;

                if (frame.bar1.temp !== null)
                    status.temp = frame.bar1.temp;
                if (frame.gps1.coords !== null)
                    status.gps1 = frame.gps1.coords;
                if (frame.gps2.coords !== null)
                    status.gps2 = frame.gps2.coords;
                if (frame.fusion.state !== null)
                    status.state = frame.fusion.state;

                if (status.gps1 === null && state.last_seen_gps1.coords !== null)
                    status.gps1 = "(at " + utils.renderTime(state.last_seen_gps1.time) + ") " + state.last_seen_gps1.coords;
                if (status.gps2 === null && state.last_seen_gps2.coords !== null)
                    status.gps2 = "(at " + utils.renderTime(state.last_seen_gps2.time) + ") " + state.last_seen_gps2.coords;
            }

            return status;
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

            // find newest gps data
            for (const frame of new_data) {
                if (frame.gps1.coords !== null &&
                    (state.last_seen_gps1.time === null || frame.time > state.last_seen_gps1.time)) {

                    state.last_seen_gps1.coords = frame.gps1.coords;
                    state.last_seen_gps1.time = frame.time;
                }
                if (frame.gps2.coords !== null &&
                    (state.last_seen_gps2.time === null || frame.time > state.last_seen_gps2.time)) {

                    state.last_seen_gps2.coords = frame.gps2.coords;
                    state.last_seen_gps2.time = frame.time;
                }
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

            // Remove data that is more than Config.keep_data_time
            // milliseconds behind the current playback position.
            state.data = state.data.filter(frame => frame.time >= state.playback_time - Config.keep_data_time);
        },
        clear (state) {
            state.data = [];
            state.duration = null;
        }
    }
});