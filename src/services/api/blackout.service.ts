import api from './index'

export default {
  async createBlackout(data: object) {
    return api.post('/blackout', data)
  },
  async getBlackout(id: string) {
    return api.get(`/blackout/${id}`)
  },
  async getBlackouts(query: object) {
    const config = {
      params: query
    }
    return api.get('/blackouts', config)
  },
  async updateBlackout(id: string, data: object) {
    return api.put(`/blackout/${id}`, data)
  },
  async deleteBlackout(id: string) {
    return api.delete(`/blackout/${id}`)
  }
}
