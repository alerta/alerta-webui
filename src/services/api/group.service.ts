import api from '.'

export default {
  async createGroup(data: object) {
    return api.post('/group', data).then((res) => res.data)
  },
  async getGroup(groupId: string) {
    return api.get(`/group/${groupId}`).then((res) => res.data)
  },
  async getGroupUsers(groupId: string) {
    return api.get(`/group/${groupId}/users`).then((res) => res.data)
  },
  async getGroups(query: object) {
    const config = {
      params: query
    }
    return api.get('/groups', config).then((res) => res.data)
  },
  async updateGroup(groupId: string, data: object) {
    return api.put(`/group/${groupId}`, data).then((res) => res.data)
  },
  async addUserToGroup(groupId: string, userId: string) {
    return api
      .put(`/group/${groupId}/user/${userId}`, {})
      .then((res) => res.data)
  },
  async removeUserFromGroup(groupId: string, userId: string) {
    return api
      .delete(`/group/${groupId}/user/${userId}`, {})
      .then((res) => res.data)
  },
  async deleteGroup(groupId: string) {
    return api.delete(`/group/${groupId}`).then((res) => res.data)
  }
}
