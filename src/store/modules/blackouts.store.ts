import BlackoutsApi from '@/services/api/blackout.service'

const namespaced = true

const state = {
  isLoading: false,

  blackouts: [],

  query: '',

  filter: {
    status: ['active', 'pending', 'expired']
  },

  pagination: {
    page: 1,
    rowsPerPage: 20,
    sortBy: 'startTime',
    descending: true,
    rowsPerPageItems: [5, 10, 20, 50, 100, 200]
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
  SET_PAGINATION(state, pagination) {
    state.pagination = Object.assign({}, state.pagination, pagination)
  },
  SET_QUERY(state, query) {
    state.query = query
  },
  SET_FILTER(state, filter) {
    state.filter = Object.assign({}, state.filter, filter)
  },
  RESET_LOADING(state) {
    state.isLoading = false
  }
}

const actions = {
  getBlackouts({commit, state}) {
    commit('SET_LOADING')

    let params = new URLSearchParams()

    params.append('q', state.query)

    state.filter.status.map(st => params.append('status', st))

    params.append('page', state.pagination.page)
    params.append('page-size', state.pagination.rowsPerPage)

    params.append('sort-by', (state.pagination.descending ? '-' : '') + state.pagination.sortBy)

    return BlackoutsApi.getBlackouts(params)
      .then(({blackouts, total, pageSize}) => commit('SET_BLACKOUTS', [blackouts, total, pageSize]))
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
  },
  setPagination({dispatch, commit}, pagination) {
    commit('SET_PAGINATION', pagination)
    dispatch('getBlackouts')
  },
  setQuery({dispatch, commit}, query) {
    commit('SET_QUERY', query)
    dispatch('getBlackouts')
  },
  setFilterStatus({dispatch, commit}, filter) {
    commit('SET_FILTER', filter)
    dispatch('getBlackouts')
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
