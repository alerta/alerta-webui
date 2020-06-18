import Vue from 'vue'
import VueRouter, { RouterOptions } from 'vue-router'

import { store } from '@/main'

import Alerts from './views/Alerts.vue'
import Alert from './views/Alert.vue'

Vue.use(VueRouter)

export function createRouter(basePath): VueRouter {
  const router = new VueRouter({
    mode: 'history',
    base: basePath || process.env.BASE_URL,
    routes: [
      {
        path: '/alerts',
        name: 'alerts',
        component: Alerts,
        props: route => ({
          query: route.query,
          isKiosk: route.query.kiosk,
          hash: route.hash
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
        component: () =>
          import(/* webpackChunkName: 'user' */ './views/Heartbeats.vue'),
        meta: { title: 'Heartbeats', requiresAuth: true }
      },
      {
        path: '/users',
        name: 'users',
        component: () =>
          import(/* webpackChunkName: 'admin' */ './views/Users.vue'),
        meta: { title: 'Users', requiresAuth: true }
      },
      {
        path: '/groups',
        name: 'groups',
        component: () =>
          import(/* webpackChunkName: 'admin' */ './views/Groups.vue'),
        meta: { title: 'Groups', requiresAuth: true }
      },
      {
        path: '/customers',
        name: 'customers',
        component: () =>
          import(/* webpackChunkName: 'admin' */ './views/Customers.vue'),
        meta: { title: 'Customers', requiresAuth: true }
      },
      {
        path: '/blackouts',
        name: 'blackouts',
        component: () =>
          import(/* webpackChunkName: 'user' */ './views/Blackouts.vue'),
        meta: { title: 'Blackouts', requiresAuth: true }
      },
      {
        path: '/perms',
        name: 'perms',
        component: () =>
          import(/* webpackChunkName: 'admin' */ './views/Perms.vue'),
        meta: { title: 'Permissions', requiresAuth: true }
      },
      {
        path: '/keys',
        name: 'apiKeys',
        component: () =>
          import(/* webpackChunkName: 'user' */ './views/ApiKeys.vue'),
        meta: { title: 'API Keys', requiresAuth: true }
      },
      {
        path: '/reports',
        name: 'reports',
        component: () =>
          import(/* webpackChunkName: 'user' */ './views/Reports.vue'),
        meta: { title: 'Reports', requiresAuth: true }
      },
      {
        path: '/profile',
        name: 'profile',
        component: () =>
          import(/* webpackChunkName: 'user' */ './views/Profile.vue'),
        meta: { title: 'Profile', requiresAuth: true }
      },
      {
        path: '/settings',
        name: 'settings',
        component: () =>
          import(/* webpackChunkName: 'user' */ './views/Settings.vue'),
        meta: { title: 'Settings', requiresAuth: true }
      },
      {
        path: '/help',
        name: 'help',
        component: () => window.open('https://docs.alerta.io/?utm_source=app', '_blank')
      },
      {
        path: '/about',
        name: 'about',
        component: () =>
          import(/* webpackChunkName: 'user' */ './views/About.vue'),
        meta: { title: 'About', requiresAuth: true }
      },
      {
        path: '/login',
        name: 'login',
        component: () =>
          import(/* webpackChunkName: 'auth' */ './views/Login.vue'),
        meta: { title: 'Login' }
      },
      {
        path: '/signup',
        name: 'signup',
        component: () =>
          import(/* webpackChunkName: 'auth' */ './views/Signup.vue'),
        meta: { title: 'Sign Up' }
      },
      {
        path: '/confirm/:token',
        name: 'confirm',
        component: () =>
          import(/* webpackChunkName: 'auth' */ './views/Confirm.vue'),
        meta: { title: 'Confirm Email' }
      },
      {
        path: '/forgot',
        name: 'forgot',
        component: () =>
          import(/* webpackChunkName: 'auth' */ './views/Forgot.vue'),
        meta: { title: 'Forgot Password' }
      },
      {
        path: '/reset/:token',
        name: 'reset',
        component: () =>
          import(/* webpackChunkName: 'auth' */ './views/Reset.vue'),
        meta: { title: 'Reset Password' }
      },
      {
        path: '/logout',
        name: 'logout',
        component: () =>
          import(/* webpackChunkName: 'auth' */ './views/Logout.vue'),
        meta: { title: 'Logout' }
      },
      {
        path: '*',
        redirect: to => {
          // redirect hashbang mode links to HTML5 mode links
          if (to.fullPath.substr(0, 3) === '/#/') {
            return { path: to.fullPath.substr(2), hash: '' }
          }
          return '/alerts'
        }
      }
    ]
  } as RouterOptions)

  // redirect users not logged in to /login if authentication enabled
  router.beforeEach((to, from, next) => {
    if ((store.getters.getConfig('auth_required') &&
      to.matched.some(record => record.meta.requiresAuth))) {
      if (!store.getters['auth/isLoggedIn']) {
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
