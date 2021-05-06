import api from './index'

export default {
  createNotificationRule(data: object) {
    return api.post('/notificationrules', data)
  },
  getNotificationRule(id: string) {
    return api.get(`/notificationrules/${id}`)
  },
  getNotificationRules(query: object) {
    let config = {
      params: query
    }
    return api.get('/notificationrules', config)
  },
  updateNotificationRule(id: string, data: object) {
    return api.put(`/notificationrules/${id}`, data)
  },
  deleteNotificationRule(id: string) {
    return api.delete(`/notificationrules/${id}`)
  }
}
