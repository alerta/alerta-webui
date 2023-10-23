import api from './index'

export default {
  createEscalationRule(data: object) {
    return api.post('/escalationrules', data)
  },
  getEscalationRule(id: string) {
    return api.get(`/escalationrules/${id}`)
  },
  getEscalationRules(query: object) {
    let config = {
      params: query
    }
    return api.get('/escalationrules', config)
  },
  updateEscalationRule(id: string, data: object) {
    return api.put(`/escalationrules/${id}`, data)
  },
  deleteEscalationRule(id: string) {
    return api.delete(`/escalationrules/${id}`)
  }
}
