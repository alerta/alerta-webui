import api from './index'

export default {
  createUser(data: object) {
    return api.post('/user', data)
  },
  getUser(userId: string) {
    return api.get(`/user/${userId}`)
  },
  getUserAttributes(userId: string) {
    return api.get(`/user/${userId}/attributes`)
  },
  getMeAttributes() {
    return api.get('/user/me/attributes')
  },
  getUsers(query: object) {
    let config = {
      params: query
    }
    return api.get('/users', config)
  },
  updateUser(userId: string, data: object) {
    return api.put(`/user/${userId}`, data)
  },
  updateMe(data: object) {
    return api.put('/user/me', data)
  },
  updateUserAttributes(userId: string, attributes: object) {
    let data = {
      attributes: attributes
    }
    return api.put(`/user/${userId}/attributes`, data)
  },
  updateMeAttributes(attributes: object) {
    let data = {
      attributes: attributes
    }
    return api.put('/user/me/attributes', data)
  },
  deleteUser(userId: string) {
    return api.delete(`/user/${userId}`)
  }
}
