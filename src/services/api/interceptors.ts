import {store} from '@/main'
import {v4 as uuidv4} from 'uuid'
import axios from 'axios'

export function makeInterceptors(router) {
  return {
    // add requestId
    requestIdHeader(config) {
      config.headers['X-Request-ID'] = uuidv4()
      return config
    },

    // response handlers
    interceptErrors(error) {
      if (!error.response && !axios.isCancel(error)) {
        store.dispatch('notifications/error', Error('Problem connecting to Alerta API, retrying...'))
      }

      if (error.response) {
        store.dispatch('notifications/error', error.response.data)
      }
      return Promise.reject(error)
    },

    // redirect to login if API rejects auth token
    redirectToLogin(error) {
      if (error.response && error.response.status === 401) {
        if (store.getters['auth/isLoggedIn']) {
          store.dispatch('auth/logout')
        }
        if (router.currentRoute.path != '/login') {
          router.replace({
            path: '/login',
            query: {redirect: router.currentRoute.fullPath}
          })
        }
      }
      return Promise.reject(error)
    }
  }
}
