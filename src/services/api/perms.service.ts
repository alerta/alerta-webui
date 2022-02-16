import api from '.'

export default {
  async createPerm(data: object) {
    return api.post('/perm', data)
  },
  async getPerms(query?: object) {
    return api.get('/perms', {
      params: query ?? {}
    })
  },
  async updatePerm(id: string, data: object) {
    return api.put(`/perm/${id}`, data)
  },
  async deletePerm(id: string) {
    return api.delete(`/perm/${id}`)
  },

  async getScopes() {
    return api.get('/scopes')
  }
}
