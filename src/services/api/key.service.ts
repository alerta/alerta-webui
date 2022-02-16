import api from '.'

export default {
  async createKey(data: object) {
    return api.post('/key', data).then((res) => res.data)
  },
  async getKey(key: string) {
    return api.get(`/key/${key}`).then((res) => res.data)
  },
  async getKeys(query: object) {
    const config = {
      params: query
    }
    return api.get('/keys', config).then((res) => res.data)
  },
  async updateKey(key: string, data: object) {
    return api.put(`/key/${key}`, data).then((res) => res.data)
  },
  async deleteKey(key: string) {
    return api.delete(`/key/${key}`).then((res) => res.data)
  }
}
