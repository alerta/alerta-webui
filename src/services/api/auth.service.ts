import api from '.'

export default {
  async confirm(token: string) {
    return api.post(`/auth/confirm/${token}`, {}).then((res) => res.data)
  },
  async forgot(email: string) {
    const data = {
      email
    }
    return api.post('/auth/forgot', data).then((res) => res.data)
  },
  async reset(token: string, password: string) {
    const data = {
      password
    }
    return api.post(`/auth/reset/${token}`, data).then((res) => res.data)
  }
}
