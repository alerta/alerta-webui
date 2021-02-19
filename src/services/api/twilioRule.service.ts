import api from './index'

export default {
  createTwilioRule(data: object) {
    return api.post('/twiliorule', data)
  },
  getTwilioRule(id: string) {
    return api.get(`/twiliorule/${id}`)
  },
  getTwilioRules(query: object) {
    let config = {
      params: query
    }
    return api.get('/twiliorule', config)
  },
  updateTwilioRule(id: string, data: object) {
    return api.put(`/twiliorule/${id}`, data)
  },
  deleteTwilioRule(id: string) {
    return api.delete(`/twiliorule/${id}`)
  }
}
