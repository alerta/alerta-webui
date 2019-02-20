import KeysApi from '@/services/api/key.service'

const namespaced = true

const state = {
  isLoading: false,

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
  RESET_LOADING(state) {
    state.isLoading = false
  }
}

const actions = {
  getKeys({ commit, dispatch }) {
    commit('SET_LOADING')
    return KeysApi.getKeys({})
      .then(({ keys }) => commit('SET_KEYS', keys))
      .catch(() => commit('RESET_LOADING'))
  },
  createKey({ dispatch, commit }, key) {
    return KeysApi.createKey(key)
      .then(response => {
        dispatch('getKeys')
      })
  },
  updateKey({ dispatch, commit }, [key, update]) {
    return KeysApi.updateKey(key, update)
      .then(response => {
        dispatch('getKeys')
      })
  },
  deleteKey({ dispatch, commit }, key) {
    return KeysApi.deleteKey(key)
      .then(response => {
        dispatch('getKeys')
      })
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
