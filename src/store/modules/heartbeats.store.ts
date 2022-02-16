import { IHeartbeats, IStore } from '@/store/interfaces'
import HeartbeatsApi from '@/services/api/heartbeat.service'
import { Module } from 'vuex'

const state: IHeartbeats = {
  isLoading: false,

  heartbeats: []
}

const heartbeats: Module<IHeartbeats, IStore> = {
  namespaced: true,
  state,
  mutations: {
    SET_LOADING(state) {
      state.isLoading = true
    },
    SET_HEARTBEATS(state, heartbeats: IHeartbeats['heartbeats']) {
      state.isLoading = false
      state.heartbeats = heartbeats
    },
    RESET_LOADING(state) {
      state.isLoading = false
    }
  },
  actions: {
    getHeartbeats: async ({ commit }) => {
      commit('SET_LOADING')
      return HeartbeatsApi.getHeartbeats()
        .then(({ heartbeats }) => commit('SET_HEARTBEATS', heartbeats))
        .catch(() => commit('RESET_LOADING'))
    },
    deleteHeartbeat: async ({ dispatch }, heartbeatId: string) =>
      HeartbeatsApi.deleteHeartbeat(heartbeatId).then(() =>
        dispatch('getHeartbeats')
      )
  }
}

export default heartbeats
