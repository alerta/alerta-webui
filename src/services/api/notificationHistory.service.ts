import api from './index'

export default {
  getNotificationHistory(query: object) {
    let config = {
      params: query
    }
    return api.get('/notificationhistory', config)
  }
}
