import { store } from '@/main'
import axios, { Axios } from 'axios'
import { v4 } from 'uuid'
export { makeInterceptors } from './interceptors'

declare global {
  interface Window {
    axios: Axios
  }
}

const api = axios.create()

window.axios = api

api.interceptors.request.use((config) => {
  config.headers = { ...config.headers, 'X-Request-ID': v4() }
  return config
})

api.interceptors.response.use(undefined, (error) => {
  if (!error.response && !axios.isCancel(error))
    store.dispatch(
      'notifications/error',
      Error('Problem connecting to Alerta API, retrying...')
    )

  if (error.response) store.dispatch('notifications/error', error.response.data)

  return Promise.reject(error)
})

export default api
