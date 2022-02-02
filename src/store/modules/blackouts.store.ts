import BlackoutsApi from '@/services/api/blackout.service'

const namespaced = true

const state = {
  isLoading: false,

  blackouts: []
}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_BLACKOUTS(state, blackouts) {
    state.isLoading = false
    state.blackouts = blackouts
  },
  RESET_LOADING(state) {
    state.isLoading = false
  }
}

const actions = {
  async getBlackouts({ commit }) {
    commit('SET_LOADING')
    return BlackoutsApi.getBlackouts({})
      .then(({ blackouts }) => commit('SET_BLACKOUTS', blackouts))
      .catch(() => commit('RESET_LOADING'))
  },
  async createBlackout({ dispatch }, blackout) {
    return BlackoutsApi.createBlackout(blackout).then(() =>
      dispatch('getBlackouts')
    )
  },
  async updateBlackout({ dispatch }, [blackoutId, update]) {
    return BlackoutsApi.updateBlackout(blackoutId, update).then(() =>
      dispatch('getBlackouts')
    )
  },
  async deleteBlackout({ dispatch }, blackoutId) {
    return BlackoutsApi.deleteBlackout(blackoutId).then(() =>
      dispatch('getBlackouts')
    )
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
