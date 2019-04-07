import api from './index'

export default {
  createGroup(data: object) {
    return api.post('/group', data)
  },
  getGroup(groupId: string) {
    return api.get(`/group/${groupId}`)
  },
  getGroupUsers(groupId: string) {
    return api.get(`/group/${groupId}/users`)
  },
  getGroups(query: object) {
    let config = {
      params: query
    }
    return api.get('/groups', config)
  },
  updateGroup(groupId: string, data: object) {
    return api.put(`/group/${groupId}`, data)
  },
  addUserToGroup(groupId: string, userId: string) {
    return api.put(`/group/${groupId}/user/${userId}`, {})
  },
  removeUserFromGroup(groupId: string, userId: string) {
    return api.delete(`/group/${groupId}/user/${userId}`, {})
  },
  deleteGroup(groupId: string) {
    return api.delete(`/group/${groupId}`)
  }
}
