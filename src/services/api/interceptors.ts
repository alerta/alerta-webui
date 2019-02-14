import { store, router } from '@/main'

export default {
  // request handlers
  addXsrfHeader(config) {
    const xsrfHeader = 'X-XSRF-TOKEN'
    const allowedMethods = ['GET', 'HEAD', 'OPTIONS']

    let isAllowed =
      config.method !== undefined && allowedMethods.includes(config.method)
    let xsrfToken = store.state.auth.payload.xsrfToken

    if (!isAllowed && xsrfToken) {
      config.headers = config.headers || {}
      config.headers[xsrfHeader] = xsrfToken
    }
    return config
  },

  // response handlers
  interceptErrors(error) {
    if (error.response) {
      store.dispatch('notifications/error', error.response.data)
    }
    return Promise.reject(error)
  },
  redirectToLogin(error) {
    if (error.response && error.response.status === 401) {
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
}
