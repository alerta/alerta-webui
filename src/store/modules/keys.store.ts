import KeysApi from '@/services/api/key.service'

const namespaced = true

const state = {
  isLoading: false,

  keys: [],

  // filter and pagination
  filter: {
    status: ['active', 'expired'],
  },

  pagination: {
    page: 1,
    rowsPerPage: 20,
    sortBy: 'lastUsedTime',
    descending: true,
    rowsPerPageItems: [10, 20, 50, 100, 200]
  }
}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_USERS(state, users) {
    state.isLoading = false
    state.users = users
  },
  SET_KEYS(state, [keys, total, pageSize]) {
    state.isLoading = false
    state.keys = keys
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
  getKeys({ commit, state }) {
    commit('SET_LOADING')

    let params = new URLSearchParams(state.query)

    state.filter.status && state.filter.status.map(st => params.append('status', st))

    // add server-side paging
    params.append('page', state.pagination.page)
    params.append('page-size', state.pagination.rowsPerPage)

    // add server-side sort
    params.append('sort-by', (state.pagination.descending ? '-' : '') + state.pagination.sortBy)

    return KeysApi.getKeys(params)
      .then(({ keys, total, pageSize }) => commit('SET_KEYS', [keys, total, pageSize]))
      .catch(() => commit('RESET_LOADING'))
  },
  createKey({ dispatch, commit }, key) {
    return KeysApi.createKey(key)
      .then(response => {
        dispatch('getKeys')
      })
  },
  updateKey({ dispatch, commit }, [key, update]) {
    return KeysApi.updateKey(key, update)
      .then(response => {
        dispatch('getKeys')
      })
  },
  deleteKey({ dispatch, commit }, key) {
    return KeysApi.deleteKey(key)
      .then(response => {
        dispatch('getKeys')
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
