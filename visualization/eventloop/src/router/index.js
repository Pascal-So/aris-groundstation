import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import MainDashboard from '@/components/MainDashboard'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'MainDashboard',
      component: MainDashboard
    },
    {
      path: '/asdf',
      name: 'HelloWorld',
      component: HelloWorld
    }
  ]
})
