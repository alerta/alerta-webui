import api from './index'

export default {
  async createGroup(data: object) {
    return api.post('/group', data)
  },
  async getGroup(groupId: string) {
    return api.get(`/group/${groupId}`)
  },
  async getGroupUsers(groupId: string) {
    return api.get(`/group/${groupId}/users`)
  },
  async getGroups(query: object) {
    const config = {
      params: query
    }
    return api.get('/groups', config)
  },
  async updateGroup(groupId: string, data: object) {
    return api.put(`/group/${groupId}`, data)
  },
  async addUserToGroup(groupId: string, userId: string) {
    return api.put(`/group/${groupId}/user/${userId}`, {})
  },
  async removeUserFromGroup(groupId: string, userId: string) {
    return api.delete(`/group/${groupId}/user/${userId}`, {})
  },
  async deleteGroup(groupId: string) {
    return api.delete(`/group/${groupId}`)
  }
}
