import UsersApi from '@/services/api/user.service'

const namespaced = true

const state = {
  isLoading: false,

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
  RESET_LOADING(state) {
    state.isLoading = false
  }
}

const actions = {
  getUsers({ commit }) {
    commit('SET_LOADING')
    return UsersApi.getUsers({})
      .then(({ users }) => commit('SET_USERS', users))
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
  },
  setEmailVerified({ dispatch, commit }, [userId, emailVerified]) {
    return UsersApi.updateUser(userId, { email_verified: emailVerified })
      .then(response => {
        dispatch('getUsers')
      })
  },
  deleteUser({ dispatch, commit }, userId) {
    return UsersApi.deleteUser(userId)
      .then(response => {
        dispatch('getUsers')
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
