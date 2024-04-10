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
  getBlackouts({commit}) {
    commit('SET_LOADING')
    return BlackoutsApi.getBlackouts({})
      .then(({blackouts}) => commit('SET_BLACKOUTS', blackouts))
      .catch(() => commit('RESET_LOADING'))
  },
  createBlackout({dispatch, commit}, blackout) {
    return BlackoutsApi.createBlackout(blackout).then(response => {
      dispatch('getBlackouts')
    })
  },
  updateBlackout({dispatch, commit}, [blackoutId, update]) {
    return BlackoutsApi.updateBlackout(blackoutId, update).then(response => {
      dispatch('getBlackouts')
    })
  },
  deleteBlackout({dispatch, commit}, blackoutId) {
    return BlackoutsApi.deleteBlackout(blackoutId).then(response => {
      dispatch('getBlackouts')
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
