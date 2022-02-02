import HeartbeatsApi from '@/services/api/heartbeat.service'

const namespaced = true

const state = {
  isLoading: false,

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
  RESET_LOADING(state) {
    state.isLoading = false
  }
}

const actions = {
  async getHeartbeats({ commit }) {
    commit('SET_LOADING')
    return HeartbeatsApi.getHeartbeats({})
      .then(({ heartbeats }) => commit('SET_HEARTBEATS', heartbeats))
      .catch(() => commit('RESET_LOADING'))
  },
  async deleteHeartbeat({ dispatch, commit }, heartbeatId) {
    return HeartbeatsApi.deleteHeartbeat(heartbeatId).then((response) => {
      dispatch('getHeartbeats')
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
