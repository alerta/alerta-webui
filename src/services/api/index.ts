import Vue from 'vue'
import axios from 'axios'
import { AxiosRequestConfig } from 'axios'

const logRequests = !!process.env.VUE_APP_DEBUG

const api = {
  get(url: string, config?: AxiosRequestConfig) {
    return this.request('GET', url, null, config)
  },

  delete(url: string, config?: AxiosRequestConfig) {
    return this.request('DELETE', url, null, config)
  },

  head(url: string, config?: AxiosRequestConfig) {
    return this.request('HEAD', url, null, config)
  },

  post(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request('POST', url, data, config)
  },

  put(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request('PUT', url, data, config)
  },

  patch(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request('PATCH', url, data, config)
  },

  request(
    method: string,
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ) {
    logRequests && console.log(`${method} ${url}...`)
    let t0 = performance.now()
    return axios.request({ ...config, url, method, data }).then(response => {
      logRequests && console.log(response)
      let t1 = performance.now()
      Vue.prototype.$track('timing_complete', {
        name: method,
        event_category: 'API',
        event_label: url,
        value: Math.round(t1 - t0)
      })
      return response.data
    })
  }
}

export default api
