import HeartbeatsApi from '@/services/api/heartbeat.service'

const namespaced = true

const state = {
  isLoading: false,

  heartbeats: [],

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
  SET_PAGINATION(state, pagination) {
    state.pagination = Object.assign({}, state.pagination, pagination)
  }
}

const actions = {
  getHeartbeats({ commit, state }) {
    commit('SET_LOADING')

    let params = new URLSearchParams(state.query)

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
  setPagination({ commit }, pagination) {
    commit('SET_PAGINATION', pagination)
  }
}

const getters = {
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
