import api from './index'

export default {
  async createKey(data: object) {
    return api.post('/key', data)
  },
  async getKey(key: string) {
    return api.get(`/key/${key}`)
  },
  async getKeys(query: object) {
    const config = {
      params: query
    }
    return api.get('/keys', config)
  },
  async updateKey(key: string, data: object) {
    return api.put(`/key/${key}`, data)
  },
  async deleteKey(key: string) {
    return api.delete(`/key/${key}`)
  }
}
