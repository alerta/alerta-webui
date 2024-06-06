import api from './index'

export default {
  getNotificationDelays(query: object) {
    let config = {
      params: {}
    }
    return api.get('/notificationdelay', config)
  },
  deleteNotificationDelay(id: string) {
    return api.delete(`/notificationdelay/${id}`)
  }
}
