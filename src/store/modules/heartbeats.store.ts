import HeartbeatsApi from '@/services/api/heartbeat.service'

const namespaced = true

const state = {
  isLoading: false,
  error: null,

  heartbeats: []
}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_HEARTBEATS(state, heartbeats) {
    state.isLoading = false
    state.heartbeats = heartbeats
  },
  SET_ERROR(state, error) {
    state.isLoading = false
    state.error = error
  }
}

const actions = {
  getHeartbeats({ commit }) {
    commit('SET_LOADING')
    return HeartbeatsApi.getHeartbeats({})
      .then(({ heartbeats }) => commit('SET_HEARTBEATS', heartbeats))
      .catch(error => commit('SET_ERROR', error.response.data.message))
  },
  deleteHeartbeat({ dispatch, commit }, heartbeatId) {
    return HeartbeatsApi.deleteHeartbeat(heartbeatId)
      .then(response => {
        dispatch('getHeartbeats')
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
