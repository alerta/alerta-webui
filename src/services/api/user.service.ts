import api from './index'

export default {
  async createUser(data: object) {
    return api.post('/user', data)
  },
  async getUser(userId: string) {
    return api.get(`/user/${userId}`)
  },
  async getUserAttributes(userId: string) {
    return api.get(`/user/${userId}/attributes`)
  },
  async getMeAttributes() {
    return api.get('/user/me/attributes')
  },
  async getUsers(query: object) {
    const config = {
      params: query
    }
    return api.get('/users', config)
  },
  async updateUser(userId: string, data: object) {
    return api.put(`/user/${userId}`, data)
  },
  async updateMe(data: object) {
    return api.put('/user/me', data)
  },
  async updateUserAttributes(userId: string, attributes: object) {
    const data = {
      attributes
    }
    return api.put(`/user/${userId}/attributes`, data)
  },
  async updateMeAttributes(attributes: object) {
    const data = {
      attributes
    }
    return api.put('/user/me/attributes', data)
  },
  async deleteUser(userId: string) {
    return api.delete(`/user/${userId}`)
  },
  async getGroups(userId: string) {
    return api.get(`/user/${userId}/groups`)
  }
}
