import { store } from '@/main'

export default {
  // response handlers
  interceptErrors(error) {
    if (error.response) {
      store.dispatch('notifications/error', error.response.data)
    }
    return Promise.reject(error)
  }
}
