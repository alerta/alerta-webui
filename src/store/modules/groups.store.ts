import GroupsApi from '@/services/api/group.service'
import i18n from '@/plugins/i18n'

const namespaced = true

const state = {
  isLoading: false,

  groups: [],
  group: {},
  users: []
}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_GROUPS(state, groups) {
    state.isLoading = false
    state.groups = groups
  },
  SET_GROUP(state, group) {
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
  }
}

const actions = {
  async getGroups({ commit }) {
    commit('SET_LOADING')
    return GroupsApi.getGroups({})
      .then(({ groups }) => commit('SET_GROUPS', groups))
      .catch(() => commit('RESET_LOADING'))
  },
  async getGroup({ commit }, groupId) {
    return GroupsApi.getGroup(groupId).then(({ group }) => {
      commit('SET_GROUP', group)
    })
  },
  async getGroupUsers({ commit }, groupId) {
    commit('SET_LOADING')
    return GroupsApi.getGroupUsers(groupId)
      .then(({ users }) => commit('SET_GROUP_USERS', users))
      .catch(() => commit('RESET_LOADING'))
  },
  clearGroupUsers({ commit }) {
    commit('RESET_GROUP_USERS')
  },
  async createGroup({ dispatch }, group) {
    return GroupsApi.createGroup(group).then(() => dispatch('getGroups'))
  },
  async updateGroup({ dispatch }, [groupId, update]) {
    return GroupsApi.updateGroup(groupId, update).then(() =>
      dispatch('getGroups')
    )
  },
  async addUserToGroup({ dispatch }, [groupId, userId]) {
    return GroupsApi.addUserToGroup(groupId, userId)
      .then(() => dispatch('getGroupUsers', groupId))
      .then(() =>
        dispatch('notifications/success', i18n.t('UserAddedGroup'), {
          root: true
        })
      )
  },
  async removeUserFromGroup({ dispatch }, [groupId, userId]) {
    return GroupsApi.removeUserFromGroup(groupId, userId)
      .then(() => dispatch('getGroupUsers', groupId))
      .then(() =>
        dispatch('notifications/success', i18n.t('UserRemovedGroup'), {
          root: true
        })
      )
  },
  async deleteGroup({ dispatch }, groupId) {
    return GroupsApi.deleteGroup(groupId).then(() => dispatch('getGroups'))
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
