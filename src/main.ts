import App from '@/App.vue'
import '@/directives/hasPerms'
import '@/filters/capitalize'
import '@/filters/date'
import '@/filters/days'
import '@/filters/hhmmss'
import '@/filters/shortId'
import '@/filters/splitCaps'
import '@/filters/timeago'
import '@/filters/until'
import GoogleAnalytics from '@/plugins/analytics'
import i18n from '@/plugins/i18n'
import vuetify from '@/plugins/vuetify'
import { createRouter } from '@/router'
import { makeInterceptors } from '@/services/api/interceptors'
import { vueAuth } from '@/services/auth'
import bootstrap from '@/services/config'
import { createStore } from '@/store'
import { makeStore } from '@/store/modules/auth.store'
import axios from 'axios'
import Vue from 'vue'
import { sync } from 'vuex-router-sync'

export const store = createStore()

bootstrap.getConfig().then((config) => {
  const router = createRouter(config.base_path)

  Vue.prototype.$config = config
  store.dispatch('updateConfig', config)
  store.dispatch('alerts/setFilter', config.filter)
  store.registerModule('auth', makeStore(vueAuth(config)))
  axios.defaults.baseURL = config.endpoint

  const interceptors = makeInterceptors(router)
  axios.interceptors.request.use(interceptors.requestIdHeader)
  axios.interceptors.response.use(undefined, interceptors.interceptErrors)
  axios.interceptors.response.use(undefined, interceptors.redirectToLogin)

  Vue.use(GoogleAnalytics, {
    trackingId: process.env.NODE_ENV === 'production' && config.tracking_id,
    router
  })
  sync(store, router)

  new Vue({
    router,
    store,
    i18n,
    vuetify,
    render: (h) => h(App)
  }).$mount('#app')
})
