import Vue from 'vue';

/*

This event bus is responsible for sending the new incoming data to the components.
We can't just pass the new data down as props, because the updating of some of the
components is a function of just the new data, not the complete data back to the
beginning of the recording, and it would be tedious to separate new from old data
when passed down as props.

Only has one channel: 'new-data'

*/

export const EventBus = new Vue();