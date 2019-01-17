import ManagementApi from '@/services/api/management.service'

const namespaced = true

const state = {
  manifest: null,

  healthcheck: null,

  application: null,
  metrics: [],
  time: null,
  uptime: null,
  version: null
}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_MANIFEST(state, manifest) {
    state.manifest = manifest
  },
  SET_HEALTHCHECK(state, healthcheck) {
    state.healthcheck = healthcheck
  },
  SET_STATUS(state, status) {
    state.application = status.application
    state.metrics = status.metrics
    state.time = status.time
    state.uptime = status.uptime
    state.version = status.version
  }
}

const actions = {
  getManifest({ commit, dispatch }) {
    return ManagementApi.manifest().then(manifest =>
      commit('SET_MANIFEST', manifest)
    )
    // .catch(error => commit('SET_ERROR', error.response.data.message));
  },
  getHealthcheck({ commit, dispatch }) {
    return ManagementApi.healthcheck().then(healthcheck =>
      commit('SET_HEALTHCHECK', healthcheck)
    )
    // .catch(error => commit('SET_ERROR', error.response.data.message));
  },
  getStatus({ commit, dispatch }) {
    return ManagementApi.status().then(status => commit('SET_STATUS', status))
    // .catch(error => commit('SET_ERROR', error.response.data.message));
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
