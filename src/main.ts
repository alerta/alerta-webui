/* eslint-disable no-console */
import bootstrap from './services/config'

import {createApp} from 'vue'

import {createStore} from './store'
import {createRouter} from './router'
import {sync} from 'vuex-router-sync'
import VueAxios from 'vue-axios'
import axios from 'axios'
import {makeStore} from '@/store/modules/auth.store'
import {makeInterceptors} from '@/services/api/interceptors'
import {vueAuth} from '@/services/auth'
import GoogleAnalytics from '@/plugins/analytics'
import i18n from '@/plugins/i18n'

import vuetify from './plugins/vuetify'
import './sass/main.sass'
import App from './App.vue'

import hasPerms from '@/directives/hasPerms'

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
  app = createApp(App)
  
  const router = createRouter(config.base_path)  
  store.dispatch('updateConfig', config)
  store.dispatch('alerts/setFilter', config.filter) 
  //These plugins must be loaded so app.config.globalProperties.$http will be set
  //before vueAuth attempts to use it
  app.use(VueAxios, axios)
  store.registerModule('auth', makeStore(vueAuth(app, config)))
  axios.defaults.baseURL = config.endpoint

  const interceptors = makeInterceptors(router)
  axios.interceptors.request.use(interceptors.requestIdHeader, undefined)
  axios.interceptors.response.use(undefined, interceptors.interceptErrors)
  axios.interceptors.response.use(undefined, interceptors.redirectToLogin)

  app.use(router) 
  app.use(i18n)
  app.use(store)
  app.use(vuetify) 

  app.directive('hasPerms', hasPerms)

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