import api from './index'

export default {
  createNotificationChannel(data: object) {
    return api.post('/notificationchannels', data)
  },
  getNotificationChannel(id: string) {
    return api.get(`/notificationchannels/${id}`)
  },
  getEncryptionKey() {
    return api.get('notificationchannels/keygen')
  },
  getNotificationChannels(query: object) {
    let config = {
      params: query
    }
    return api.get('/notificationchannels', config)
  },
  updateNotificationChannel(id: string, data: object) {
    return api.put(`/notificationchannels/${id}`, data)
  },
  deleteNotificationChannel(id: string) {
    return api.delete(`/notificationchannels/${id}`)
  }
}
