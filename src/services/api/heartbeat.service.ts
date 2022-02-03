import api from './index'

export default {
  async getHeartbeat(id: string) {
    return api.get(`/heartbeat/${id}`)
  },
  async getHeartbeats(query?: object) {
    const config = {
      params: query ?? {}
    }
    return api.get('/heartbeats', config)
  },
  async deleteHeartbeat(id: string) {
    return api.delete(`/heartbeat/${id}`)
  }
}
