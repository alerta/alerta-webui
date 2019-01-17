import api from './index'

export default {
  createKey(data: object) {
    return api.post('/key', data)
  },
  getKey(key: string) {
    return api.get(`/key/${key}`)
  },
  getKeys(query: object) {
    let config = {
      params: query
    }
    return api.get('/keys', config)
  },
  updateKey(key: string, data: object) {
    return api.put(`/key/${key}`, data)
  },
  deleteKey(key: string) {
    return api.delete(`/key/${key}`)
  }
}
