import Vue from 'vue'
import Router from 'vue-router'
import Overview from '@/components/Overview'
import FlightSelection from '@/components/FlightSelection'
import HelloWorld from '@/components/HelloWorld'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'FlightSelection',
      component: FlightSelection,
    },
    {
      path: '/flight/:database',
      name: 'Overview',
      component: Overview,
      props: true,
    },
    {
      path: '/info',
      name: 'Info',
      component: HelloWorld
    }
  ]
})
