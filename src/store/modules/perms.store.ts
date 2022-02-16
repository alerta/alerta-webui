import { IPerms, IStore } from '@/store/interfaces'
import PermsApi from '@/services/api/perms.service'
import { Module } from 'vuex'

const state: IPerms = {
  isLoading: false,

  permissions: [],
  scopes: []
}

const perms: Module<IPerms, IStore> = {
  namespaced: true,
  state,
  mutations: {
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
    RESET_LOADING(state) {
      state.isLoading = false
    }
  },
  actions: {
    async getPerms({ commit }) {
      commit('SET_LOADING')
      return PermsApi.getPerms()
        .then(({ permissions }) => commit('SET_PERMS', permissions))
        .catch(() => commit('RESET_LOADING'))
    },
    async createPerm({ dispatch }, perm) {
      return PermsApi.createPerm(perm).then(() => dispatch('getPerms'))
    },
    async updatePerm({ dispatch }, [permId, update]) {
      return PermsApi.updatePerm(permId, update).then(() =>
        dispatch('getPerms')
      )
    },
    async deletePerm({ dispatch }, permId) {
      return PermsApi.deletePerm(permId).then(() => dispatch('getPerms'))
    },

    async getScopes({ commit }) {
      commit('SET_LOADING')
      return PermsApi.getScopes().then(({ scopes }) =>
        commit('SET_SCOPES', scopes)
      )
    }
  },
  getters: {
    roles: (state) => {
      return state.permissions.map((p) => p.match)
    }
  }
}

export default perms
