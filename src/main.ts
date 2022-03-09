import App from '@/App.vue'
import '@/assets/style/main.scss'
import '@/directives/hasPerms'
import '@/filters'
import { i18n, vuetify } from '@/plugins'
import { createRouter } from '@/router'
import api, { makeInterceptors } from '@/services/api'
import { vueAuth } from '@/services/auth'
import bootstrap from '@/services/config'
import { createStore } from '@/store'
import { makeAuthStore } from '@/store/modules/auth.store'
import Vue from 'vue'

// import * as Sentry from '@sentry/vue'
// import { BrowserTracing } from "@sentry/tracing"

export const store = createStore()

bootstrap.getConfig().then((config) => {
  const router = createRouter(config.base_path)

  Vue.prototype.$config = config
  store.dispatch('updateConfig', config)
  store.dispatch('alerts/setFilter', config.filter)
  store.registerModule('auth', makeAuthStore(vueAuth(config)))

  api.defaults.baseURL = config.endpoint

  const interceptors = makeInterceptors(router)
  api.interceptors.response.use(undefined, interceptors.redirectToLogin)

  // Sentry.init({
  //   Vue: Vue,
  //   dsn: '__PUBLIC_DSN__',
  //   integrations: [
  //     new BrowserTracing({
  //       routingInstrumentation: Sentry.vueRouterInstrumentation(router),
  //       tracingOrigins: ["localhost", /^\//],
  //     }),
  //   ],
  //   // Set tracesSampleRate to 1.0 to capture 100%
  //   // of transactions for performance monitoring.
  //   // We recommend adjusting this value in production
  //   tracesSampleRate: 1.0,
  // })

  new Vue({
    router,
    store,
    i18n,
    vuetify,
    render: (h) => h(App)
  }).$mount('#app')
})
