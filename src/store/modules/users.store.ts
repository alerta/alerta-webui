import UsersApi from '@/services/api/user.service'
import i18n from '@/plugins/i18n'

const namespaced = true

const state = {
  isLoading: false,

  domains: [],
  users: [],
  groups: [],

  // filter and pagination
  filter: {
    status: ['active', 'inactive'],
    roles: [],
  },

  pagination: {
    page: 1,
    rowsPerPage: 20,
    sortBy: 'name',
    descending: false,
    rowsPerPageItems: [10, 20, 50, 100, 200]
  }
}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_USERS(state, [users, total, pageSize]) {
    state.isLoading = false
    state.users = users
    state.pagination.totalItems = total
    state.pagination.rowsPerPage = pageSize
  },
  SET_USER_GROUPS(state, groups) {
    state.groups = groups
  },
  RESET_USER_GROUPS(state) {
    state.groups = []
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
  getUsers({ commit, state }) {
    commit('SET_LOADING')

    let params = new URLSearchParams(state.query)

    state.filter.status && state.filter.status.map(st => params.append('status', st))
    state.filter.roles && state.filter.roles.map(r => params.append('role', r))

    // add server-side paging
    params.append('page', state.pagination.page)
    params.append('page-size', state.pagination.rowsPerPage)

    // add server-side sort
    params.append('sort-by', (state.pagination.descending ? '-' : '') + state.pagination.sortBy)

    return UsersApi.getUsers(params)
      .then(({ users, total, pageSize }) => commit('SET_USERS', [users, total, pageSize]))
      .catch(() => commit('RESET_LOADING'))
  },
  createUser({ dispatch, commit }, user) {
    return UsersApi.createUser(user)
      .then(response => {
        dispatch('getUsers')
      })
  },
  updateUser({ dispatch, commit }, [userId, update]) {
    return UsersApi.updateUser(userId, update)
      .then(response => {
        dispatch('getUsers')
      })
  },
  setUserStatus({ dispatch, commit }, [userId, status]) {
    return UsersApi.updateUser(userId, { status: status })
      .then(response => {
        dispatch('getUsers')
      })
      .then(() => dispatch('notifications/success', i18n.t('UserStatusSaved'), { root: true }))
  },
  setEmailVerified({ dispatch, commit }, [userId, emailVerified]) {
    return UsersApi.updateUser(userId, { email_verified: emailVerified })
      .then(response => {
        dispatch('getUsers')
      })
      .then(() => dispatch('notifications/success', i18n.t('EmailSaved'), { root: true }))
  },
  deleteUser({ dispatch, commit }, userId) {
    return UsersApi.deleteUser(userId)
      .then(response => {
        dispatch('getUsers')
      })
  },
  getUserGroups({ dispatch, commit }, userId) {
    return UsersApi.getGroups(userId)
      .then(({ groups }) => commit('SET_USER_GROUPS', groups))
  },
  resetUserGroups({ commit }) {
    commit('RESET_USER_GROUPS')
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
  filterRoles: state => {
    return state.filter.roles
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
