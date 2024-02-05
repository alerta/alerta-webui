import api from './index'

export default {
  createNotificationGroup(data: object) {
    return api.post('/notificationgroups', data)
  },
  getNotificationGroup(id: string) {
    return api.get(`/notificationgroups/${id}`)
  },
  getNotificationGroups(query: object) {
    let config = {
      params: query
    }
    return api.get('/notificationgroups', config)
  },
  updateNotificationGroup(id: string, data: object) {
    return api.put(`/notificationgroups/${id}`, data)
  },
  deleteNotificationGroup(id: string) {
    return api.delete(`/notificationgroups/${id}`)
  }
}
