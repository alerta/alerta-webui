import PermsApi from '@/services/api/perms.service'

const namespaced = true

const state = {
  isLoading: false,
  error: null,

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
  SET_ERROR(state, error) {
    state.isLoading = false
    state.error = error
  }
}

const actions = {
  getPerms({ commit }) {
    commit('SET_LOADING')
    return PermsApi.getPerms({})
      .then(({ permissions }) => commit('SET_PERMS', permissions))
      .catch(error => commit('SET_ERROR', error.response.data.message))
  },
  createPerm({ dispatch, commit }, perm) {
    return PermsApi.createPerm(perm)
      .then(response => {
        dispatch('getPerms')
      })
      .catch(error => commit('SET_ERROR', error.response.data.message))
  },
  updatePerm({ dispatch, commit }, [permId, update]) {
    return PermsApi.updatePerm(permId, update)
      .then(response => {
        dispatch('getPerms')
      })
      .catch(error => dispatch('notifications/error', error, { root: true }))
  },
  deletePerm({ dispatch, commit }, permId) {
    return PermsApi.deletePerm(permId)
      .then(response => {
        dispatch('getPerms')
      })
      .catch(error => commit('SET_ERROR', error.response.data.message))
  },

  getScopes({ commit }) {
    commit('SET_LOADING')
    return PermsApi.getScopes()
      .then(({ scopes }) => commit('SET_SCOPES', scopes))
      .catch(error => commit('SET_ERROR', error.response.data.message))
  }
}

const getters = {
  roles: state => {
    return state.permissions.map(p => p.match)
    // },
    // scopes: state => have => {
  }
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
