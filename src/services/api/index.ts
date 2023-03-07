import axios from 'axios'
import {AxiosRequestConfig, Method} from 'axios'
import app from '@/main'

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

  request(method: Method, url: string, data?: any, config?: AxiosRequestConfig) {
    let t0 = performance.now()
    return axios.request({...config, url, method, data}).then(response => {
      let t1 = performance.now() 
      
      app.config.globalProperties.$track('timing_complete', {
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
