import api from './index'

export default {
  getHeartbeat(id: string) {
    return api.get(`/heartbeat/${id}`)
  },
  getHeartbeats(query: object) {
    let config = {
      params: query
    }
    return api.get('/heartbeats', config)
  },
  deleteHeartbeat(id: string) {
    return api.delete(`/heartbeat/${id}`)
  }
}
