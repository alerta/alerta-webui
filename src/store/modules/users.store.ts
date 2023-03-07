import UsersApi from '@/services/api/user.service'
import i18n from '@/plugins/i18n'

const namespaced = true

const state = {
  isLoading: false,

  domains: [],
  users: [],
  groups: []
}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_USERS(state, users) {
    state.isLoading = false
    state.users = users
  },
  SET_USER_GROUPS(state, groups) {
    state.groups = groups
  },
  RESET_USER_GROUPS(state) {
    state.groups = []
  },
  RESET_LOADING(state) {
    state.isLoading = false
  }
}

const actions = {
  getUsers({commit}) {
    commit('SET_LOADING')
    return UsersApi.getUsers({})
      .then(({users}) => commit('SET_USERS', users))
      .catch(() => commit('RESET_LOADING'))
  },
  createUser({dispatch, commit}, user) {
    return UsersApi.createUser(user).then(response => {
      dispatch('getUsers')
    })
  },
  updateUser({dispatch, commit}, [userId, update]) {
    return UsersApi.updateUser(userId, update).then(response => {
      dispatch('getUsers')
    })
  },
  setUserStatus({dispatch, commit}, [userId, status]) {
    return UsersApi.updateUser(userId, {status: status})
      .then(response => {
        dispatch('getUsers')
      })
      .then(() =>
        dispatch('notifications/success', i18n.global.t('UserStatusSaved'), {
          root: true
        })
      )
  },
  setEmailVerified({dispatch, commit}, [userId, emailVerified]) {
    return UsersApi.updateUser(userId, {email_verified: emailVerified})
      .then(response => {
        dispatch('getUsers')
      })
      .then(() => dispatch('notifications/success', i18n.global.t('EmailSaved'), {root: true}))
  },
  deleteUser({dispatch, commit}, userId) {
    return UsersApi.deleteUser(userId).then(response => {
      dispatch('getUsers')
    })
  },
  getUserGroups({dispatch, commit}, userId) {
    return UsersApi.getGroups(userId).then(({groups}) => commit('SET_USER_GROUPS', groups))
  },
  resetUserGroups({commit}) {
    commit('RESET_USER_GROUPS')
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
