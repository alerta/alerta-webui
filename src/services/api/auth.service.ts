import api from './index'

export default {
  confirm(token: string) {
    return api.post(`/auth/confirm/${token}`, {})
  },
  forgot(email: string) {
    let data = {
      email: email
    }
    return api.post('/auth/forgot', data)
  },
  reset(token: string, password: string) {
    let data = {
      password: password
    }
    return api.post(`/auth/reset/${token}`, data)
  }
}
