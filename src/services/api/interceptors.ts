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
    store.dispatch('notifications/error', error.response.data)
    return Promise.reject(error)
  },
  redirectToLogin(error) {
    if (
      error.response.status === 401 &&
      !error.response.data.errors.includes('invalid_token')
    ) {
      if (router.currentRoute.path != '/login') {
        store.dispatch('auth/logout')
        router.replace({
          path: '/login',
          query: { redirect: router.currentRoute.fullPath }
        })
      }
    }
    return Promise.reject(error)
  }
}
