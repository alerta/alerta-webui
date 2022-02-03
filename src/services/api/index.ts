import axios, { AxiosRequestConfig, Method } from 'axios'
import Vue from 'vue'

const api = {
  async get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>('GET', url, null, config)
  },

  async delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>('DELETE', url, null, config)
  },

  async head<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>('HEAD', url, null, config)
  },

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>('POST', url, data, config)
  },

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>('PUT', url, data, config)
  },

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>('PATCH', url, data, config)
  },

  async request<T = any>(
    method: Method,
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ) {
    const t0 = performance.now()
    return axios
      .request<T>({ ...config, url, method, data })
      .then((response) => {
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
