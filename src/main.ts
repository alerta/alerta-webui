import bootstrap from './services/config'

import Vue from 'vue'

import { createStore } from './store'
import { createRouter } from './router'
import { sync } from 'vuex-router-sync'
import axios from 'axios'
import { makeStore } from '@/store/modules/auth.store'
import interceptors from '@/services/api/interceptors'
import { vueAuth } from '@/services/auth'
import GoogleAnalytics from '@/plugins/analytics'

import '@/plugins/vuetify'
import './stylus/main.styl'
import App from './App.vue'

import '@/directives/hasPerms'

import '@/filters/capitalize'
import '@/filters/date'
import '@/filters/hhmmss'
import '@/filters/shortId'
import '@/filters/splitCaps'
import '@/filters/timeago'
import '@/filters/until'

export function createApp() {
  const store = createStore()
  const router = createRouter()
  sync(store, router)

  const app = new Vue({
    router,
    store,
    render: (h: any) => h(App)
  })

  return { app, router, store }
}

export const { app, router, store }: any = createApp()

bootstrap.getConfig().then(config => {
  Vue.prototype.$config = config
  axios.defaults.baseURL = config.endpoint

  store.dispatch('update', config)
  store.registerModule('auth', makeStore(vueAuth(config)))

  Vue.use(GoogleAnalytics, {
    trackingId: config.tracking_id,
    router
  })

  axios.interceptors.request.use(interceptors.addXsrfHeader)
  axios.interceptors.response.use(undefined, interceptors.interceptErrors)
  axios.interceptors.response.use(undefined, interceptors.redirectToLogin)

  app.$mount('#app')
})
