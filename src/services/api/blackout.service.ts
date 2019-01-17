import api from './index'

export default {
  createBlackout(data: object) {
    return api.post('/blackout', data)
  },
  getBlackout(id: string) {
    return api.get(`/blackout/${id}`)
  },
  getBlackouts(query: object) {
    let config = {
      params: query
    }
    return api.get('/blackouts', config)
  },
  updateBlackout(id: string, data: object) {
    return api.put(`/blackout/${id}`, data)
  },
  deleteBlackout(id: string) {
    return api.delete(`/blackout/${id}`)
  }
}
