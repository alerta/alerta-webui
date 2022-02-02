import axios, { AxiosRequestConfig, Method } from 'axios'
import Vue from 'vue'

const api = {
  async get(url: string, config?: AxiosRequestConfig) {
    return this.request('GET', url, null, config)
  },

  async delete(url: string, config?: AxiosRequestConfig) {
    return this.request('DELETE', url, null, config)
  },

  async head(url: string, config?: AxiosRequestConfig) {
    return this.request('HEAD', url, null, config)
  },

  async post(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request('POST', url, data, config)
  },

  async put(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request('PUT', url, data, config)
  },

  async patch(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request('PATCH', url, data, config)
  },

  async request(
    method: Method,
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ) {
    const t0 = performance.now()
    return axios.request({ ...config, url, method, data }).then((response) => {
      const t1 = performance.now()
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
