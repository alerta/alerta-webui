import api from '.'

export default {
  async getHeartbeat(id: string) {
    return api.get(`/heartbeat/${id}`).then((res) => res.data)
  },
  async getHeartbeats(query?: object) {
    const config = {
      params: query ?? {}
    }
    return api.get('/heartbeats', config).then((res) => res.data)
  },
  async deleteHeartbeat(id: string) {
    return api.delete(`/heartbeat/${id}`).then((res) => res.data)
  }
}
