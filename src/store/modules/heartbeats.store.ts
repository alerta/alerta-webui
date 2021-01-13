import HeartbeatsApi from '@/services/api/heartbeat.service'

const namespaced = true

const state = {
  isLoading: false,

  heartbeats: [],

  // filter and pagination
  filter: {
    status: ['ok', 'slow', 'expired'],
  },

  pagination: {
    page: 1,
    rowsPerPage: 20,
    sortBy: 'receiveTime',
    descending: true,
    rowsPerPageItems: [10, 20, 50, 100, 200]
  }
}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_HEARTBEATS(state, [heartbeats, total, pageSize]) {
    state.isLoading = false
    state.heartbeats = heartbeats
    state.pagination.totalItems = total
    state.pagination.rowsPerPage = pageSize
  },
  RESET_LOADING(state) {
    state.isLoading = false
  },
  SET_FILTER(state, filter): any {
    state.filter = Object.assign({}, state.filter, filter)
  },
  SET_PAGINATION(state, pagination) {
    state.pagination = Object.assign({}, state.pagination, pagination)
  }
}

const actions = {
  getHeartbeats({ commit, state }) {
    commit('SET_LOADING')

    let params = new URLSearchParams(state.query)

    state.filter.status && state.filter.status.map(st => params.append('status', st))

    // add server-side paging
    params.append('page', state.pagination.page)
    params.append('page-size', state.pagination.rowsPerPage)

    // add server-side sort
    params.append('sort-by', (state.pagination.descending ? '-' : '') + state.pagination.sortBy)

    return HeartbeatsApi.getHeartbeats(params)
      .then(({ heartbeats, total, pageSize }) => commit('SET_HEARTBEATS', [heartbeats, total, pageSize]))
      .catch(() => commit('RESET_LOADING'))
  },
  deleteHeartbeat({ dispatch, commit }, heartbeatId) {
    return HeartbeatsApi.deleteHeartbeat(heartbeatId)
      .then(response => {
        dispatch('getHeartbeats')
      })
  },

  setFilter({ commit }, filter) {
    commit('SET_FILTER', filter)
  },
  setPagination({ commit }, pagination) {
    commit('SET_PAGINATION', pagination)
  }
}

const getters = {
  filterStatus: state => {
    return state.filter.status
  },
  pagination: state => {
    return state.pagination
  }
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
