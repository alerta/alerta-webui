import { store } from '@/main'
import { v4 as uuidv4 } from 'uuid'
import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import VueRouter from 'vue-router'

export const makeInterceptors = (router: VueRouter) => ({
  // add requestId
  requestIdHeader(config: AxiosRequestConfig) {
    config.headers = { ...config.headers, 'X-Request-ID': uuidv4() }
    return config
  },

  // response handlers
  async interceptErrors(error: AxiosError) {
    if (!error.response && !axios.isCancel(error)) {
      store.dispatch(
        'notifications/error',
        Error('Problem connecting to Alerta API, retrying...')
      )
    }

    if (error.response)
      store.dispatch('notifications/error', error.response.data)

    return Promise.reject(error)
  },

  // redirect to login if API rejects auth token
  async redirectToLogin(error: AxiosError) {
    if (error.response?.status === 401) {
      if (store.getters['auth/isLoggedIn']) {
        store.dispatch('auth/logout')
      }
      if (router.currentRoute.path != '/login') {
        router.replace({
          path: '/login',
          query: { redirect: router.currentRoute.fullPath }
        })
      }
    }
    return Promise.reject(error)
  }
})
