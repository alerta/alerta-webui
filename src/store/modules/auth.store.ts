import AuthApi from '@/services/api/auth.service'

export function makeStore(vueAuth) {
  return {
    namespaced: true,

    state: {
      isAuthenticated: vueAuth.isAuthenticated(),
      token: vueAuth.getToken(),
      payload: vueAuth.getPayload(),

      isSending: false
    },

    mutations: {
      SET_AUTH(state, [payload, token]) {
        state.isAuthenticated = true
        state.token = token
        state.payload = payload
      },
      RESET_AUTH(state) {
        state.isAuthenticated = false
        state.token = null
        state.payload = {}
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
          .then(() => commit('SET_AUTH', [vueAuth.getPayload(), vueAuth.getToken()]))
          .then(() => dispatch('getUserPrefs', {}, { root: true }))
          .finally(() => commit('RESET_SENDING'))
      },
      login({ commit, dispatch }, credentials) {
        return vueAuth
          .login(credentials)
          .then(() => commit('SET_AUTH', [vueAuth.getPayload(), vueAuth.getToken()]))
          .then(() => dispatch('getUserPrefs', {}, { root: true }))
      },
      authenticate({ commit, dispatch }, provider) {
        return vueAuth
          .authenticate(provider)
          .then(() => commit('SET_AUTH', [vueAuth.getPayload(), vueAuth.getToken()]))
          .then(() => dispatch('getUserPrefs', {}, { root: true }))
      },
      confirm({ commit }, token) {
        return AuthApi.confirm(token)
      },
      forgot({ commit }, email) {
        commit('SET_SENDING')
        return AuthApi
          .forgot(email)
          .finally(() => commit('RESET_SENDING'))
      },
      reset({ commit }, [token, password]) {
        return AuthApi.reset(token, password)
      },
      logout({ commit }) {
        if (!vueAuth.isAuthenticated()) return
        return vueAuth
          .logout()
          .then(() => commit('RESET_AUTH'))
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
        return vueAuth.isAuthenticated()
      },
      scopes(state) {
        return state.payload && state.payload.scope ? state.payload.scope.split(' ') : []
      },
      isAdmin(state, getters) {
        if (getters.isLoggedIn) {
          return getters.scopes.includes('admin')
        }
        return false
      }
    }
  }
}
