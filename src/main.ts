import bootstrap from './services/config'

import {createApp} from 'vue'

import {createStore} from './store'
import {createRouter} from './router'
import {sync} from 'vuex-router-sync'
import axios from 'axios'
import {makeStore} from '@/store/modules/auth.store'
import {makeInterceptors} from '@/services/api/interceptors'
import {vueAuth} from '@/services/auth'
import GoogleAnalytics from '@/plugins/analytics'
import i18n from '@/plugins/i18n'

import '@/plugins/vuetify'
import './sass/main.sass'
import App from './App.vue'

import '@/directives/hasPerms'

import capitalize from '@/filters/capitalize'
import date from '@/filters/date'
import days from '@/filters/days'
import hhmmss from '@/filters/hhmmss'
import shortId from '@/filters/shortId'
import splitCaps from '@/filters/splitCaps'
import timeago from '@/filters/timeago'
import until from '@/filters/until'

export const store = createStore()

let app
bootstrap.getConfig().then(config => {
  const router = createRouter(config.base_path)

  store.dispatch('updateConfig', config)
  store.dispatch('alerts/setFilter', config.filter)
  store.registerModule('auth', makeStore(vueAuth(config)))
  axios.defaults.baseURL = config.endpoint

  const interceptors = makeInterceptors(router)
  axios.interceptors.request.use(interceptors.requestIdHeader, undefined)
  axios.interceptors.response.use(undefined, interceptors.interceptErrors)
  axios.interceptors.response.use(undefined, interceptors.redirectToLogin)

  app = createApp({
    router,
    store,
    i18n,
    render: (h:any) => h(App)
  })
  app.use(router)
  app.config.globalProperties.$config = config

  app.config.globalProperties.$filters = {
    capitalize,
    date,
    days,
    hhmmss,
    shortId,
    splitCaps,
    timeago,
    until
  }

  app.use(GoogleAnalytics, {
    trackingId: config.tracking_id,
    router
  })
  sync(store, router)

  app.mount('#app')
})

export default app