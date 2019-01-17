import BlackoutsApi from '@/services/api/blackout.service'

const namespaced = true

const state = {
  isLoading: false,
  error: null,

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
  SET_ERROR(state, error) {
    state.isLoading = false
    state.error = error
  }
}

const actions = {
  getBlackouts({ commit }) {
    commit('SET_LOADING')
    return BlackoutsApi.getBlackouts({})
      .then(({ blackouts }) => commit('SET_BLACKOUTS', blackouts))
      .catch(error => commit('SET_ERROR', error.response.data.message))
  },
  createBlackout({ dispatch, commit }, blackout) {
    return BlackoutsApi.createBlackout(blackout)
      .then(response => {
        dispatch('getBlackouts')
      })
      .catch(error => commit('SET_ERROR', error.response.data.message))
  },
  updateBlackout({ dispatch, commit }, [blackoutId, update]) {
    return BlackoutsApi.updateBlackout(blackoutId, update)
      .then(response => {
        dispatch('getBlackouts')
      })
      .catch(error => dispatch('notifications/error', error, { root: true }))
  },
  deleteBlackout({ dispatch, commit }, blackoutId) {
    return BlackoutsApi.deleteBlackout(blackoutId)
      .then(response => {
        dispatch('getBlackouts')
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
