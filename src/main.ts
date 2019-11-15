import bootstrap from './services/config'

import Vue from 'vue'
import i18n from '@/plugins/i18n'

import { createStore } from './store'
import { createRouter } from './router'
import { sync } from 'vuex-router-sync'
import axios from 'axios'
import { makeStore } from '@/store/modules/auth.store'
import { makeInterceptors } from '@/services/api/interceptors'
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

bootstrap.getConfig()
  .then(config => {
    const router = createRouter(config.base_path)

    Vue.prototype.$config = config
    store.dispatch('updateConfig', config)
    store.registerModule('auth', makeStore(vueAuth(config)))
    axios.defaults.baseURL = config.endpoint

    const interceptors = makeInterceptors(router)
    axios.interceptors.response.use(undefined, interceptors.interceptErrors)
    axios.interceptors.response.use(undefined, interceptors.redirectToLogin)

    Vue.use(GoogleAnalytics, {
      trackingId: config.tracking_id,
      router
    })
    sync(store, router)

    new Vue({
      router,
      store,
      i18n,
      render: (h: any) => h(App)
    }).$mount('#app')
  })
