import { IManagement, IStore } from '@/common/interfaces'
import ManagementApi from '@/services/api/management.service'
import { Module } from 'vuex'

const state: IManagement = {
  manifest: null,

  healthcheck: null,
  status: null,

  application: null,
  metrics: [],
  time: null,
  uptime: null,
  version: null
}

const management: Module<IManagement, IStore> = {
  namespaced: true,
  state,
  mutations: {
    SET_LOADING(state) {
      state.isLoading = true
    },
    SET_MANIFEST(state, manifest: IManagement['manifest']) {
      state.manifest = manifest
    },
    SET_HEALTHCHECK(state, healthcheck: IManagement['healthcheck']) {
      state.healthcheck = healthcheck
    },
    SET_STATUS(state, status: IManagement) {
      state.application = status.application
      state.metrics = status.metrics
      state.time = status.time
      state.uptime = status.uptime
      state.version = status.version
    }
  },
  actions: {
    async getManifest({ commit }) {
      return ManagementApi.manifest().then((manifest) =>
        commit('SET_MANIFEST', manifest)
      )
    },
    async getHealthcheck({ commit }) {
      return ManagementApi.healthcheck().then((healthcheck) =>
        commit('SET_HEALTHCHECK', healthcheck)
      )
    },
    async getStatus({ commit }) {
      return ManagementApi.status().then((status) =>
        commit('SET_STATUS', status)
      )
    }
  }
}

export default management
