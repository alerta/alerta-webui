import { store } from '@/main'

export function makeInterceptors(router) {
  return {
  // response handlers
    interceptErrors(error) {
      if (error.response) {
        store.dispatch('notifications/error', error.response.data)
      }
      return Promise.reject(error)
    },
  
    // redirect to login if API rejects auth token
    redirectToLogin(error) {
      if (error.response && error.response.status === 401) {
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
}
