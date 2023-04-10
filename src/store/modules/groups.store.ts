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
  }
}

const actions = {
  getGroups({commit}) {
    commit('SET_LOADING')
    return GroupsApi.getGroups({})
      .then(({groups}) => commit('SET_GROUPS', groups))
      .catch(() => commit('RESET_LOADING'))
  },
  getGroup({commit}, groupId) {
    return GroupsApi.getGroup(groupId).then(({group}) => {
      commit('SET_GROUP', group)
    })
  },
  getGroupUsers({commit}, groupId) {
    commit('SET_LOADING')
    return GroupsApi.getGroupUsers(groupId)
      .then(({users}) => commit('SET_GROUP_USERS', users))
      .catch(() => commit('RESET_LOADING'))
  },
  clearGroupUsers({commit}) {
    commit('RESET_GROUP_USERS')
  },
  createGroup({dispatch, commit}, group) {
    return GroupsApi.createGroup(group).then(response => {
      dispatch('getGroups')
    })
  },
  updateGroup({dispatch, commit}, [groupId, update]) {
    return GroupsApi.updateGroup(groupId, update).then(response => {
      dispatch('getGroups')
    })
  },
  addUserToGroup({dispatch, commit}, [groupId, userId]) {
    return GroupsApi.addUserToGroup(groupId, userId)
      .then(response => {
        dispatch('getGroupUsers', groupId)
      })
      .then(() =>
        dispatch('notifications/success', i18n.global.t('UserAddedGroup'), {
          root: true
        })
      )
  },
  removeUserFromGroup({dispatch, commit}, [groupId, userId]) {
    return GroupsApi.removeUserFromGroup(groupId, userId)
      .then(response => {
        dispatch('getGroupUsers', groupId)
      })
      .then(() =>
        dispatch('notifications/success', i18n.global.t('UserRemovedGroup'), {
          root: true
        })
      )
  },
  deleteGroup({dispatch, commit}, groupId) {
    return GroupsApi.deleteGroup(groupId).then(response => {
      dispatch('getGroups')
    })
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
