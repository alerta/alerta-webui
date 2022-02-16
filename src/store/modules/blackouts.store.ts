import { IBlackouts, IStore } from '@/store/interfaces'
import BlackoutsApi from '@/services/api/blackout.service'
import { Module } from 'vuex'

const state: IBlackouts = {
  isLoading: false,

  blackouts: []
}

const blackouts: Module<IBlackouts, IStore> = {
  namespaced: true,
  state,
  mutations: {
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
  },
  actions: {
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
}

export default blackouts
