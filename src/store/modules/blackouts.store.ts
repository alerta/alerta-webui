import BlackoutsApi from '@/services/api/blackout.service'

const namespaced = true

const state = {
  isLoading: false,

  blackouts: [],

  // filter and pagination
  filter: {
    status: ['active', 'pending', 'expired'],
  },

  pagination: {
    page: 1,
    rowsPerPage: 20,
    sortBy: 'startTime',
    descending: true,
    rowsPerPageItems: [10, 20, 50, 100, 200]
  }
}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_BLACKOUTS(state, [blackouts, total, pageSize]) {
    state.isLoading = false
    state.blackouts = blackouts
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
  getBlackouts({ commit, state }) {
    commit('SET_LOADING')

    let params = new URLSearchParams(state.query)

    state.filter.status && state.filter.status.map(st => params.append('status', st))

    // add server-side paging
    params.append('page', state.pagination.page)
    params.append('page-size', state.pagination.rowsPerPage)

    // add server-side sort
    params.append('sort-by', (state.pagination.descending ? '-' : '') + state.pagination.sortBy)

    return BlackoutsApi.getBlackouts(params)
      .then(({ blackouts, total, pageSize }) => commit('SET_BLACKOUTS', [blackouts, total, pageSize]))
      .catch(() => commit('RESET_LOADING'))
  },
  createBlackout({ dispatch, commit }, blackout) {
    return BlackoutsApi.createBlackout(blackout)
      .then(response => {
        dispatch('getBlackouts')
      })
  },
  updateBlackout({ dispatch, commit }, [blackoutId, update]) {
    return BlackoutsApi.updateBlackout(blackoutId, update)
      .then(response => {
        dispatch('getBlackouts')
      })
  },
  deleteBlackout({ dispatch, commit }, blackoutId) {
    return BlackoutsApi.deleteBlackout(blackoutId)
      .then(response => {
        dispatch('getBlackouts')
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
