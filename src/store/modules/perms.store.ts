import PermsApi from '@/services/api/perms.service'

const namespaced = true

const state = {
  isLoading: false,

  permissions: [],
  scopes: [],

  pagination: {
    page: 1,
    rowsPerPage: 20,
    sortBy: 'match',
    descending: true,
    rowsPerPageItems: [5, 10, 20, 50, 100, 200]
  }
}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_PERMS(state, [permissions, total, pageSize]) {
    state.isLoading = false
    state.permissions = permissions
    state.pagination.totalItems = total
    state.pagination.rowsPerPage = pageSize
  },
  SET_SCOPES(state, scopes) {
    state.isLoading = false
    state.scopes = scopes
  },
  RESET_LOADING(state) {
    state.isLoading = false
  }
}

const actions = {
  getPerms({commit, state}) {
    commit('SET_LOADING')

    let params = new URLSearchParams()

    params.append('page', state.pagination.page)
    params.append('page-size', state.pagination.rowsPerPage)

    params.append('sort-by', (state.pagination.descending ? '-' : '') + state.pagination.sortBy)

    return PermsApi.getPerms(params)
      .then(({permissions, total, pageSize}) => commit('SET_PERMS', [permissions, total, pageSize]))
      .catch(() => commit('RESET_LOADING'))
  },
  createPerm({dispatch, commit}, perm) {
    return PermsApi.createPerm(perm).then(response => {
      dispatch('getPerms')
    })
  },
  updatePerm({dispatch, commit}, [permId, update]) {
    return PermsApi.updatePerm(permId, update).then(response => {
      dispatch('getPerms')
    })
  },
  deletePerm({dispatch, commit}, permId) {
    return PermsApi.deletePerm(permId).then(response => {
      dispatch('getPerms')
    })
  },
  getScopes({commit}) {
    commit('SET_LOADING')
    return PermsApi.getScopes().then(({scopes}) => commit('SET_SCOPES', scopes))
  },
  setPagination({dispatch, commit}, pagination) {
    commit('SET_PAGINATION', pagination)
    dispatch('getPerms')
  }
}

const getters = {
  roles: state => {
    return state.permissions.map(p => p.match)
  }
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
