import AuthApi from '@/services/api/auth.service'
import { IAuth, IStore } from '@/store/interfaces'
import { VueAuthenticate } from '@alerta/vue-authenticate'
import * as Sentry from '@sentry/vue'
import { Module } from 'vuex'

export const makeAuthStore = (
  vueAuth: VueAuthenticate
): Module<IAuth, IStore> => ({
  namespaced: true,

  state: {
    isAuthenticated: vueAuth.isAuthenticated(),
    token: vueAuth.getToken(),
    payload: vueAuth.getPayload(),

    isSending: false
  },

  mutations: {
    SET_AUTH(state, [token, payload]) {
      state.isAuthenticated = true
      state.token = token
      state.payload = payload

      Sentry.setUser({
        email: payload.email,
        username: payload.preferred_username
      })
    },
    RESET_AUTH(state) {
      state.isAuthenticated = false
      state.token = null
      state.payload = {}

      Sentry.configureScope((scope) => scope.setUser(null))
    },
    SET_SENDING(state) {
      state.isSending = true
    },
    RESET_SENDING(state) {
      state.isSending = false
    }
  },

  actions: {
    signup({ commit, dispatch }, { name, email, password, text }) {
      commit('SET_SENDING')
      return vueAuth
        .register({
          name,
          email,
          password,
          text
        })
        .then(() =>
          commit('SET_AUTH', [vueAuth.getToken(), vueAuth.getPayload()])
        )
        .then(() => dispatch('getUserPrefs', {}, { root: true }))
        .finally(() => commit('RESET_SENDING'))
    },
    login({ commit, dispatch }, credentials) {
      return vueAuth
        .login(credentials)
        .then(() =>
          commit('SET_AUTH', [vueAuth.getToken(), vueAuth.getPayload()])
        )
        .then(() => dispatch('getUserPrefs', {}, { root: true }))
    },
    authenticate({ commit, dispatch }, provider) {
      return vueAuth
        .authenticate(provider)
        .then(() =>
          commit('SET_AUTH', [vueAuth.getToken(), vueAuth.getPayload()])
        )
        .then(() => dispatch('getUserPrefs', {}, { root: true }))
    },
    setToken({ commit, dispatch }, token) {
      vueAuth.setToken(token)
      commit('SET_AUTH', [token, vueAuth.getPayload()])
      dispatch('getUserPrefs', {}, { root: true })
    },
    async confirm({}, token) {
      return AuthApi.confirm(token)
    },
    async forgot({ commit }, email) {
      commit('SET_SENDING')
      return AuthApi.forgot(email).finally(() => commit('RESET_SENDING'))
    },
    async reset({}, [token, password]) {
      return AuthApi.reset(token, password)
    },
    logout({ commit }) {
      return vueAuth.logout().finally(() => commit('RESET_AUTH'))
    }
  },

  getters: {
    getOptions() {
      return vueAuth.options
    },
    getPayload(state) {
      return state.payload
    },
    isLoggedIn(state) {
      return state.isAuthenticated
    },
    getId(state) {
      return state.payload?.sub
    },
    getUsername(state) {
      return state.payload?.preferred_username
    },
    getAvatar(state) {
      return state.payload?.picture
    },
    scopes(state) {
      return state.payload?.scope ? state.payload.scope.split(' ') : []
    },
    customers(state) {
      return state.payload.customers?.length === 0
        ? ['ALL (*)']
        : state.payload.customers
    },
    isAdmin(_state, getters) {
      return getters.isLoggedIn && getters.scopes.includes('admin')
    }
  }
})
