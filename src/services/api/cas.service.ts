import api from './index'

export default {
  authenticate(ticket: string, service: string) {
    return api.post('/auth/cas', {
      ticket,
      service
    })
  }
}