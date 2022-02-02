import api from './index'

export default {
  async confirm(token: string) {
    return api.post(`/auth/confirm/${token}`, {})
  },
  async forgot(email: string) {
    const data = {
      email
    }
    return api.post('/auth/forgot', data)
  },
  async reset(token: string, password: string) {
    const data = {
      password
    }
    return api.post(`/auth/reset/${token}`, data)
  }
}
