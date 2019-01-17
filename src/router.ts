import Vue from 'vue'
import VueRouter, { RouterOptions } from 'vue-router'

import Home from './views/Home.vue'
import Alerts from './views/Alerts.vue'
import Alert from './views/Alert.vue'
import Heartbeats from './views/Heartbeats.vue'
import Blackouts from './views/Blackouts.vue'
import Users from './views/Users.vue'
import Perms from './views/Perms.vue'
import Customers from './views/Customers.vue'
import ApiKeys from './views/ApiKeys.vue'

import Login from './views/Login.vue'
import Signup from './views/Signup.vue'
import Confirm from './views/Confirm.vue'
import Forgot from './views/Forgot.vue'
import Reset from './views/Reset.vue'
import Settings from './views/Settings.vue'

Vue.use(VueRouter)

import { store } from './main'

export function createRouter(): VueRouter {
  const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
      {
        path: '/',
        redirect: { name: 'alerts' }
      },
      {
        path: '/alerts',
        name: 'alerts',
        component: Alerts,
        meta: { requiresAuth: true }
      },
      {
        path: '/alert/:id',
        name: 'alert',
        component: Alert,
        meta: { requiresAuth: true }
      },
      {
        path: '/heartbeats',
        name: 'heartbeats',
        component: Heartbeats,
        meta: { requiresAuth: true }
      },
      {
        path: '/blackouts',
        name: 'blackouts',
        component: Blackouts,
        meta: { requiresAuth: true }
      },
      {
        path: '/users',
        name: 'users',
        component: Users,
        meta: { requiresAuth: true }
      },
      {
        path: '/perms',
        name: 'perms',
        component: Perms,
        meta: { requiresAuth: true }
      },
      {
        path: '/customers',
        name: 'customers',
        component: Customers,
        meta: { requiresAuth: true }
      },
      {
        path: '/keys',
        name: 'apiKeys',
        component: ApiKeys,
        meta: { requiresAuth: true }
      },
      {
        path: '/about',
        name: 'about',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(/* webpackChunkName: 'about' */ './views/About.vue')
      },
      {
        path: '/login',
        name: 'login',
        component: Login
      },
      {
        path: '/signup',
        name: 'signup',
        component: Signup
      },
      {
        path: '/confirm/:token',
        name: 'confirm',
        component: Confirm
      },
      {
        path: '/forgot',
        name: 'forgot',
        component: Forgot
      },
      {
        path: '/reset/:token',
        name: 'reset',
        component: Reset
      },
      {
        path: '/settings',
        name: 'settings',
        component: Settings,
        meta: { requiresAuth: true }
      }
    ]
  } as RouterOptions)

  // redirect users not logged in to /login if authentication enabled
  router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (!router.app.$store.getters['auth/isLoggedIn']) {
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
      } else {
        next()
      }
    } else {
      next()
    }
  })

  // redirect hashbang mode links to HTML5 mode links
  router.beforeEach((to, from, next) => {
    if (to.fullPath.substr(0, 2) === '/#') {
      const pathMinusHashbang = to.fullPath.substr(2)
      console.log('rewriting ', to.fullPath, ' to ', pathMinusHashbang)
      next(pathMinusHashbang)
    } else {
      next()
    }
  })

  router.beforeEach((to, from, next) => {
    let externalUrl = to.fullPath.replace('/', '')
    if (externalUrl.match(/^(http(s)?|ftp):\/\//)) {
      window.open(externalUrl, '_blank')
    } else {
      next()
    }
  })

  return router
}
