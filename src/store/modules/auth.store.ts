import AuthApi from '@/services/api/auth.service'

export function makeStore(vueAuth) {
  return {
    namespaced: true,

    state: {
      isAuthenticated: false,
      token: null,
      payload: {},

      isSending: false
    },

    mutations: {
      SET_AUTH(state, payload) {
        state.isAuthenticated = true
        state.payload = payload
      },
      RESET_AUTH(state) {
        state.isAuthenticated = false
        state.payload = {}
      },
      SET_TOKEN(state, token) {
        state.token = token
      },
      CLEAR_TOKEN(state) {
        state.token = null
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
        return vueAuth
          .register({
            name,
            email,
            password,
            text
          })
          .then(() => commit('SET_AUTH', vueAuth.getPayload()))
          .then(() => commit('SET_TOKEN', vueAuth.getToken()))
          .then(() => dispatch('getUserPrefs', {}, { root: true }))
          .catch(error =>
            dispatch('notifications/error', error, { root: true })
          )
      },
      login({ commit, dispatch }, { credentials }) {
        return vueAuth
          .login(credentials)
          .then(() => commit('SET_AUTH', vueAuth.getPayload()))
          .then(() => commit('SET_TOKEN', vueAuth.getToken()))
          .then(() => dispatch('getUserPrefs', {}, { root: true }))
          .catch(error =>
            dispatch('notifications/error', error, { root: true })
          )
      },
      authenticate({ commit, dispatch }, payload) {
        return vueAuth
          .authenticate(payload.provider)
          .then(() => commit('SET_AUTH', vueAuth.getPayload()))
          .then(() => commit('SET_TOKEN', vueAuth.getToken()))
          .then(() => dispatch('getUserPrefs', {}, { root: true }))
          .catch(error =>
            dispatch('notifications/error', error, { root: true })
          )
      },
      confirm({ commit }, token) {
        return AuthApi.confirm(token)
      },
      forgot({ commit }, email) {
        commit('SET_SENDING')
        return AuthApi.forgot(email).then(() => commit('RESET_SENDING'))
      },
      reset({ commit }, [token, password]) {
        return AuthApi.reset(token, password)
      },
      logout({ commit, dispatch }) {
        return vueAuth
          .logout()
          .then(() => commit('RESET_AUTH'))
          .then(() => commit('CLEAR_TOKEN'))
          .catch(error =>
            dispatch('notifications/error', error, { root: true })
          )
      }
    },

    getters: {
      getPayload() {
        return vueAuth.getPayload()
      },
      isLoggedIn(state) {
        return state.isAuthenticated // vueAuth.isAuthenticated();
      },
      scopes(state) {
        return 'scope' in state.payload ? state.payload.scope.split(' ') : []
      },
      isAdmin(state, getters) {
        if (getters.isLoggedIn) {
          return getters.scopes.includes('admin')
        }
        return false
      },
      isCustomerViews(state, getters) {
        if (getters.isLoggedIn) {
          return 'customers' in state.payload
        }
        return false
      }
    }
  }
}
