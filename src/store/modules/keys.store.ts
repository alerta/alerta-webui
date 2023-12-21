import KeysApi from '@/services/api/key.service'

const namespaced = true

const state = {
  isLoading: false,

  keys: [],

  filter: {
    status: ['active', 'expired']
  },

  pagination: {
    page: 1,
    rowsPerPage: 20,
    sortBy: 'lastUsedTime',
    descending: true,
    rowsPerPageItems: [5, 10, 20, 50, 100, 200]
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
  getKeys({commit, state}) {
    commit('SET_LOADING')
    let params = new URLSearchParams()

    state.filter.status.map(st => params.append('status', st))

    params.append('page', state.pagination.page)
    params.append('page-size', state.pagination.rowsPerPage)

    params.append('sort-by', (state.pagination.descending ? '-' : '') + state.pagination.sortBy)

    return KeysApi.getKeys(params)
      .then(({keys, total, pageSize}) => commit('SET_KEYS', [keys, total, pageSize]))
      .catch(() => commit('RESET_LOADING'))
  },
  createKey({dispatch, commit}, key) {
    return KeysApi.createKey(key).then(response => {
      dispatch('getKeys')
    })
  },
  updateKey({dispatch, commit}, [key, update]) {
    return KeysApi.updateKey(key, update).then(response => {
      dispatch('getKeys')
    })
  },
  deleteKey({dispatch, commit}, key) {
    return KeysApi.deleteKey(key).then(response => {
      dispatch('getKeys')
    })
  },
  setPagination({dispatch, commit}, pagination) {
    commit('SET_PAGINATION', pagination)
    dispatch('getKeys')
  },
  setFilter({dispatch, commit}, filter) {
    commit('SET_FILTER', filter)
    dispatch('getKeys')
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
