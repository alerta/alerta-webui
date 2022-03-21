import api from '.'

export default {
  async createUser(data: object) {
    return api.post('/user', data).then((res) => res.data)
  },
  async getUser(userId: string) {
    return api.get(`/user/${userId}`).then((res) => res.data)
  },
  async getUserAttributes(userId: string) {
    return api.get(`/user/${userId}/attributes`).then((res) => res.data)
  },
  async getMeAttributes() {
    return api.get('/user/me/attributes').then((res) => res.data)
  },
  async getUsers(query: object) {
    const config = {
      params: query
    }
    return api.get('/users/new', config).then((res) => res.data)
  },
  async updateUser(userId: string, data: object) {
    return api.put(`/user/${userId}`, data).then((res) => res.data)
  },
  async updateMe(data: object) {
    return api.put('/user/me', data).then((res) => res.data)
  },
  async updateUserAttributes(userId: string, attributes: object) {
    const data = {
      attributes
    }
    return api.put(`/user/${userId}/attributes`, data).then((res) => res.data)
  },
  async updateMeAttributes(attributes: object) {
    const data = {
      attributes
    }
    return api.put('/user/me/attributes', data).then((res) => res.data)
  },
  async deleteUser(userId: string) {
    return api.delete(`/user/${userId}`)
  },
  async getGroups(userId: string) {
    return api.get(`/user/${userId}/groups`).then((res) => res.data)
  }
}
