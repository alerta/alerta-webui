import api from '.'

export default {
  async createBlackout(data: object) {
    return api.post('/blackout', data).then((res) => res.data)
  },
  async getBlackout(id: string) {
    return api.get(`/blackout/${id}`).then((res) => res.data)
  },
  async getBlackouts(query: object) {
    const config = {
      params: query
    }
    return api.get('/blackouts', config).then((res) => res.data)
  },
  async updateBlackout(id: string, data: object) {
    return api.put(`/blackout/${id}`, data).then((res) => res.data)
  },
  async deleteBlackout(id: string) {
    return api.delete(`/blackout/${id}`).then((res) => res.data)
  }
}
