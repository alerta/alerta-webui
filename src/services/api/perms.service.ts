import api from '.'

export default {
  async createPerm(data: object) {
    return api.post('/perm', data).then((res) => res.data)
  },
  async getPerms(query?: object) {
    return api
      .get('/perms', {
        params: query ?? {}
      })
      .then((res) => res.data)
  },
  async updatePerm(id: string, data: object) {
    return api.put(`/perm/${id}`, data).then((res) => res.data)
  },
  async deletePerm(id: string) {
    return api.delete(`/perm/${id}`).then((res) => res.data)
  },

  async getScopes() {
    return api.get('/scopes').then((res) => res.data)
  }
}
