import api from './index'
import axios from 'axios'

let queryInProgress

export default {
  createFilter(data: object) {
    return api.post('/filter', data)
  },
  getFilter(id: string) {
    return api.get(`/filter/${id}`)
  },
  getFilters(query: object) {
    if (query && queryInProgress) {
      queryInProgress.cancel('Too many search requests. Cancelling current query.')
    }
    queryInProgress = axios.CancelToken.source()

    let config = {
      params: query,
      cancelToken: queryInProgress.token
    }
    return api.get('/filters', config)
  },
  updateFilter(id: string, data: object) {
    return api.put(`/filter/${id}`, data)
  },
  deleteFilter(id: string) {
    return api.delete(`/filter/${id}`)
  },
  getFilterTypes(query: object) {
    let config = {
      params: query
    }
    return api.get('/filters/types', config)
  },
}
