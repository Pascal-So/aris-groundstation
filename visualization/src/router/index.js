import Vue from 'vue'
import Router from 'vue-router'
import Overview from '@/components/Overview'
import HelloWorld from '@/components/HelloWorld'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Overview',
      component: Overview
    },
    {
      path: '/info',
      name: 'Info',
      component: HelloWorld
    }
  ]
})
