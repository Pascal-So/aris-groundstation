import Vue from 'vue'
import Router from 'vue-router'
import Overview from '@/components/Overview'
import HelloWorld from '@/components/HelloWorld'

Vue.use(Router)

const User = {
    props: ['id'],
    template: '<div>User {{ id }}</div>',
    mounted(){
      console.log("mounted User component");
    }
} 

export default new Router({
  routes: [
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
