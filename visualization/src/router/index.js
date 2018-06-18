import Vue from 'vue'
import Router from 'vue-router'
import About from '@/components/About'
import Overview from '@/components/Overview'
import FlightSelection from '@/components/FlightSelection'

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
      path: '/about',
      name: 'About',
      component: About,
    },
  ]
})
