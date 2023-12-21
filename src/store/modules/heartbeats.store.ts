import HeartbeatsApi from '@/services/api/heartbeat.service'

const namespaced = true

const state = {
  isLoading: false,

  heartbeats: [],

  filter: {
    status: ['ok', 'slow', 'expired']
  },

  pagination: {
    page: 1,
    rowsPerPage: 20,
    sortBy: 'receiveTime',
    descending: true,
    rowsPerPageItems: [5, 10, 20, 50, 100, 200]
  }
}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_HEARTBEATS(state, heartbeats) {
    state.isLoading = false
    state.heartbeats = heartbeats
  },
  SET_PAGINATION(state, pagination) {
    state.pagination = Object.assign({}, state.pagination, pagination)
  },
  SET_FILTER(state, filter) {
    state.filter = Object.assign({}, state.filter, filter)
  },
  RESET_LOADING(state) {
    state.isLoading = false
  }
}

const actions = {
  getHeartbeats({commit, state}) {
    commit('SET_LOADING')

    let params = new URLSearchParams()

    state.filter.status.map(st => params.append('status', st))

    params.append('page', state.pagination.page)
    params.append('page-size', state.pagination.rowsPerPage)

    params.append('sort-by', (state.pagination.descending ? '-' : '') + state.pagination.sortBy)

    return HeartbeatsApi.getHeartbeats(params)
      .then(({heartbeats}) => commit('SET_HEARTBEATS', heartbeats))
      .catch(() => commit('RESET_LOADING'))
  },
  deleteHeartbeat({dispatch, commit}, heartbeatId) {
    return HeartbeatsApi.deleteHeartbeat(heartbeatId).then(response => {
      dispatch('getHeartbeats')
    })
  },
  setPagination({dispatch, commit}, pagination) {
    commit('SET_PAGINATION', pagination)
    dispatch('getHeartbeats')
  },
  setFilter({dispatch, commit}, filter) {
    commit('SET_FILTER', filter)
    dispatch('getHeartbeats')
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
