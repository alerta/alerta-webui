import KeysApi from '@/services/api/key.service'

const namespaced = true

const state = {
  isLoading: false,
  error: null,

  keys: []
}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_USERS(state, users) {
    state.isLoading = false
    state.users = users
  },
  SET_KEYS(state, keys) {
    state.isLoading = false
    state.keys = keys
  },
  SET_ERROR(state, error) {
    state.isLoading = false
    state.error = error
  }
}

const actions = {
  getKeys({ commit, dispatch }) {
    commit('SET_LOADING')
    return KeysApi.getKeys({})
      .then(({ keys }) => commit('SET_KEYS', keys))
      .catch(error => commit('SET_ERROR', error.response.data.message))
  },
  createKey({ dispatch, commit }, key) {
    return KeysApi.createKey(key)
      .then(response => {
        dispatch('getKeys')
      })
      .catch(error => commit('SET_ERROR', error.response.data.message))
  },
  updateKey({ dispatch, commit }, [key, update]) {
    return KeysApi.updateKey(key, update)
      .then(response => {
        dispatch('getKeys')
      })
      .catch(error => dispatch('notifications/error', error, { root: true }))
  },
  deleteKey({ dispatch, commit }, key) {
    return KeysApi.deleteKey(key)
      .then(response => {
        dispatch('getKeys')
      })
      .catch(error => commit('SET_ERROR', error.response.data.message))
  }
}

const getters = {
  //
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
