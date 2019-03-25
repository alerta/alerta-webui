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
import Reports from './views/Reports.vue'

import Login from './views/Login.vue'
import Signup from './views/Signup.vue'
import Confirm from './views/Confirm.vue'
import Forgot from './views/Forgot.vue'
import Reset from './views/Reset.vue'
import Settings from './views/Settings.vue'

Vue.use(VueRouter)

export function createRouter(): VueRouter {
  const router = new VueRouter({
    mode: 'history',
    base: '/alerta-web/',
    routes: [
      {
        path: '/',
        name: 'home',
        component: Home,
        meta: { title: 'Home' }
      },
      {
        path: '/alerts',
        name: 'alerts',
        component: Alerts,
        props: route => ({
          query: route.query.q,
          isKiosk: route.query.kiosk,
        }),
        meta: { title: 'Alerts', requiresAuth: true }
      },
      {
        path: '/alert/:id',
        name: 'alert',
        component: Alert,
        props: true,
        meta: { title: 'Alert Detail', requiresAuth: true }
      },
      {
        path: '/heartbeats',
        name: 'heartbeats',
        component: Heartbeats,
        meta: { title: 'Heartbeats', requiresAuth: true }
      },
      {
        path: '/blackouts',
        name: 'blackouts',
        component: Blackouts,
        meta: { title: 'Blackouts', requiresAuth: true }
      },
      {
        path: '/users',
        name: 'users',
        component: Users,
        meta: { title: 'Users', requiresAuth: true }
      },
      {
        path: '/perms',
        name: 'perms',
        component: Perms,
        meta: { title: 'Permissions', requiresAuth: true }
      },
      {
        path: '/customers',
        name: 'customers',
        component: Customers,
        meta: { title: 'Customers', requiresAuth: true }
      },
      {
        path: '/keys',
        name: 'apiKeys',
        component: ApiKeys,
        meta: { title: 'API Keys', requiresAuth: true }
      },
      {
        path: '/reports',
        name: 'reports',
        component: Reports,
        meta: { title: 'Reports', requiresAuth: true }
      },
      {
        path: '/about',
        name: 'about',
        component: () =>
          import(/* webpackChunkName: 'about' */ './views/About.vue'),
        meta: { title: 'About', requiresAuth: true }
      },
      {
        path: '/login',
        name: 'login',
        component: Login,
        meta: { title: 'Login' }
      },
      {
        path: '/signup',
        name: 'signup',
        component: Signup,
        meta: { title: 'Sign Up' }
      },
      {
        path: '/confirm/:token',
        name: 'confirm',
        component: Confirm,
        meta: { title: 'Confirm Email' }
      },
      {
        path: '/forgot',
        name: 'forgot',
        component: Forgot,
        meta: { title: 'Forgot Password' }
      },
      {
        path: '/reset/:token',
        name: 'reset',
        component: Reset,
        meta: { title: 'Reset Password' }
      },
      {
        path: '/settings',
        name: 'settings',
        component: Settings,
        meta: { title: 'Settings', requiresAuth: true }
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

  router.beforeEach((to, from, next) => {
    if (to.meta.title) {
      document.title = to.meta.title + ' | Alerta'
    }
    next()
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
