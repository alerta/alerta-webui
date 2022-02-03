import UsersApi from '@/services/api/user.service'
import i18n from '@/plugins/i18n'
import { Module } from 'vuex'
import { IStore, IUsers } from '@/common/interfaces'

const state: IUsers = {
  isLoading: false,

  domains: [],
  users: [],
  groups: []
}

const users: Module<IUsers, IStore> = {
  namespaced: true,
  state,
  mutations: {
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
  },
  actions: {
    async getUsers({ commit }) {
      commit('SET_LOADING')
      return UsersApi.getUsers({})
        .then(({ users }) => commit('SET_USERS', users))
        .catch(() => commit('RESET_LOADING'))
    },
    async createUser({ dispatch }, user) {
      return UsersApi.createUser(user).then(() => dispatch('getUsers'))
    },
    async updateUser({ dispatch }, [userId, update]) {
      return UsersApi.updateUser(userId, update).then(() =>
        dispatch('getUsers')
      )
    },
    async setUserStatus({ dispatch }, [userId, status]) {
      return UsersApi.updateUser(userId, { status })
        .then(() => dispatch('getUsers'))
        .then(() =>
          dispatch('notifications/success', i18n.t('UserStatusSaved'), {
            root: true
          })
        )
    },
    async setEmailVerified({ dispatch }, [userId, emailVerified]) {
      return UsersApi.updateUser(userId, { email_verified: emailVerified })
        .then(() => dispatch('getUsers'))
        .then(() =>
          dispatch('notifications/success', i18n.t('EmailSaved'), {
            root: true
          })
        )
    },
    async deleteUser({ dispatch }, userId) {
      return UsersApi.deleteUser(userId).then(() => dispatch('getUsers'))
    },
    async getUserGroups({ commit }, userId) {
      return UsersApi.getGroups(userId).then(({ groups }) =>
        commit('SET_USER_GROUPS', groups)
      )
    },
    resetUserGroups({ commit }) {
      commit('RESET_USER_GROUPS')
    }
  }
}

export default users
