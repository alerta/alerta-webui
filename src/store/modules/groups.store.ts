import GroupsApi from '@/services/api/group.service'
import i18n from '@/plugins/i18n'

const namespaced = true

const state = {
  isLoading: false,

  groups: [],
  group: {},
  users: [],

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
  SET_GROUPS(state, [groups, total, pageSize]) {
    state.isLoading = false
    state.groups = groups
    state.pagination.totalItems = total
    state.pagination.rowsPerPage = pageSize
  },
  SET_GROUP(state, group): any {
    state.group = group
  },
  SET_GROUP_USERS(state, users) {
    state.isLoading = false
    state.users = users
  },
  RESET_GROUP_USERS(state) {
    state.users = []
  },
  RESET_LOADING(state) {
    state.isLoading = false
  },
  SET_PAGINATION(state, pagination) {
    state.pagination = Object.assign({}, state.pagination, pagination)
  }
}

const actions = {
  getGroups({ commit, state }) {
    commit('SET_LOADING')

    let params = new URLSearchParams(state.query)

    // add server-side paging
    params.append('page', state.pagination.page)
    params.append('page-size', state.pagination.rowsPerPage)

    // add server-side sort
    params.append('sort-by', (state.pagination.descending ? '-' : '') + state.pagination.sortBy)

    return GroupsApi.getGroups(params)
      .then(({ groups, total, pageSize }) => commit('SET_GROUPS', [groups, total, pageSize]))
      .catch(() => commit('RESET_LOADING'))
  },
  getGroup({ commit }, groupId) {
    return GroupsApi.getGroup(groupId).then(({ group }) => {
      commit('SET_GROUP', group)
    })
  },
  getGroupUsers({ commit }, groupId) {
    commit('SET_LOADING')
    return GroupsApi.getGroupUsers(groupId)
      .then(({ users }) => commit('SET_GROUP_USERS', users))
      .catch(() => commit('RESET_LOADING'))
  },
  clearGroupUsers({ commit }) {
    commit('RESET_GROUP_USERS')
  },
  createGroup({ dispatch, commit }, group) {
    return GroupsApi.createGroup(group)
      .then(response => {
        dispatch('getGroups')
      })
  },
  updateGroup({ dispatch, commit }, [groupId, update]) {
    return GroupsApi.updateGroup(groupId, update)
      .then(response => {
        dispatch('getGroups')
      })
  },
  addUserToGroup({ dispatch, commit }, [groupId, userId]) {
    return GroupsApi.addUserToGroup(groupId, userId)
      .then(response => {
        dispatch('getGroupUsers', groupId)
      })
      .then(() => dispatch('notifications/success', i18n.t('UserAddedGroup'), { root: true }))
  },
  removeUserFromGroup({ dispatch, commit }, [groupId, userId]) {
    return GroupsApi.removeUserFromGroup(groupId, userId)
      .then(response => {
        dispatch('getGroupUsers', groupId)
      })
      .then(() => dispatch('notifications/success', i18n.t('UserRemovedGroup'), { root: true }))
  },
  deleteGroup({ dispatch, commit }, groupId) {
    return GroupsApi.deleteGroup(groupId)
      .then(response => {
        dispatch('getGroups')
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
