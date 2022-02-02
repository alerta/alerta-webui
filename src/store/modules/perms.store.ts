import PermsApi from '@/services/api/perms.service'

const namespaced = true

const state = {
  isLoading: false,

  permissions: [],
  scopes: []
}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_PERMS(state, permissions) {
    state.isLoading = false
    state.permissions = permissions
  },
  SET_SCOPES(state, scopes) {
    state.isLoading = false
    state.scopes = scopes
  },
  RESET_LOADING(state) {
    state.isLoading = false
  }
}

const actions = {
  async getPerms({ commit }) {
    commit('SET_LOADING')
    return PermsApi.getPerms({})
      .then(({ permissions }) => commit('SET_PERMS', permissions))
      .catch(() => commit('RESET_LOADING'))
  },
  async createPerm({ dispatch }, perm) {
    return PermsApi.createPerm(perm).then(() => dispatch('getPerms'))
  },
  async updatePerm({ dispatch }, [permId, update]) {
    return PermsApi.updatePerm(permId, update).then(() => dispatch('getPerms'))
  },
  async deletePerm({ dispatch }, permId) {
    return PermsApi.deletePerm(permId).then(() => dispatch('getPerms'))
  },

  async getScopes({ commit }) {
    commit('SET_LOADING')
    return PermsApi.getScopes().then(({ scopes }) =>
      commit('SET_SCOPES', scopes)
    )
  }
}

const getters = {
  roles: (state) => {
    return state.permissions.map((p) => p.match)
  }
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
