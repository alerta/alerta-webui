import api from './index'

export default {
  createOnCall(data: object) {
    return api.post('/oncalls', data)
  },
  getOnCall(id: string) {
    return api.get(`/oncalls/${id}`)
  },
  getOnCalls(query: object) {
    let config = {
      params: query
    }
    return api.get('/oncalls', config)
  },
  updateOnCall(id: string, data: object) {
    return api.put(`/oncalls/${id}`, data)
  },
  deleteOnCall(id: string) {
    return api.delete(`/oncalls/${id}`)
  }
}
