import api from './index'

export default {
  createPerm(data: object) {
    return api.post('/perm', data)
  },
  getPerms(query: object) {
    let config = {
      params: query
    }
    return api.get('/perms', config)
  },
  updatePerm(id: string, data: object) {
    return api.put(`/perm/${id}`, data)
  },
  deletePerm(id: string) {
    return api.delete(`/perm/${id}`)
  },

  getScopes() {
    return api.get('/scopes')
  }
}
