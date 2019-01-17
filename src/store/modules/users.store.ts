import UsersApi from '@/services/api/user.service'

const namespaced = true

const state = {
  isLoading: false,
  error: null,

  domains: [],
  users: []
}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_USERS(state, users) {
    state.isLoading = false
    state.users = users
  },
  SET_ERROR(state, error) {
    state.isLoading = false
    state.error = error
  }
}

const actions = {
  getUsers({ commit }) {
    commit('SET_LOADING')
    return UsersApi.getUsers({})
      .then(({ users }) => commit('SET_USERS', users))
      .catch(error => commit('SET_ERROR', error.response.data.message))
  },
  createUser({ dispatch, commit }, user) {
    return UsersApi.createUser(user)
      .then(response => {
        dispatch('getUsers')
      })
      .catch(error => commit('SET_ERROR', error.response.data.message))
  },
  updateUser({ dispatch, commit }, [userId, update]) {
    return UsersApi.updateUser(userId, update)
      .then(response => {
        dispatch('getUsers')
      })
      .catch(error => dispatch('notifications/error', error, { root: true }))
  },
  setUserStatus({ dispatch, commit }, [userId, status]) {
    return UsersApi.updateUser(userId, { status: status })
      .then(response => {
        dispatch('getUsers')
      })
      .catch(error => commit('SET_ERROR', error.response.data.message))
  },
  setEmailVerified({ dispatch, commit }, [userId, emailVerified]) {
    return UsersApi.updateUser(userId, { email_verified: emailVerified })
      .then(response => {
        dispatch('getUsers')
      })
      .catch(error => commit('SET_ERROR', error.response.data.message))
  },
  deleteUser({ dispatch, commit }, userId) {
    return UsersApi.deleteUser(userId)
      .then(response => {
        dispatch('getUsers')
      })
      .catch(error => commit('SET_ERROR', error.response.data.message))
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
