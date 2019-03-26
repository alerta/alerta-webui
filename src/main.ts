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
import '@/filters/days'
import '@/filters/hhmmss'
import '@/filters/shortId'
import '@/filters/splitCaps'
import '@/filters/timeago'
import '@/filters/until'

export const store = createStore()

export function createApp(config) {
  const router = createRouter(config.base_url)
  sync(store, router)

  const app = new Vue({
    router,
    store,
    render: (h: any) => h(App)
  })
  return { app, router }
}

bootstrap.getConfig().then(config => {
  Vue.prototype.$config = config
  axios.defaults.baseURL = config.endpoint

  const { app, router }: any = createApp(config)

  store.dispatch('update', config)
  store.registerModule('auth', makeStore(vueAuth(config)))

  Vue.use(GoogleAnalytics, {
    trackingId: config.tracking_id,
    router
  })

  axios.interceptors.response.use(undefined, interceptors.interceptErrors)

  app.$mount('#app')
})
