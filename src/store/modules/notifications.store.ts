const namespaced = true

const state = {
  snackbars: [],
  banners: []
}

// SNACKBAR
// {
//   type: 'success', 'info', 'error'
//   text: '',
//   action: 'RETRY',
//   timeout: 6000
// }

// BANNER
// {
//   type: success, info, warning or error
//   icon: null,  // check_circle, info, priority_high, warning,
//   text: ''
// }

const mutations = {
  ADD_SNACKBAR(state, snackbar) {
    state.snackbars.push(snackbar)
  },
  REMOVE_SNACKBAR(state) {
    state.snackbars.shift()
  },
  ADD_BANNER(state, banner) {
    state.banners.push(banner)
  },
  REMOVE_BANNER(state) {
    state.banners.shift()
  }
}

const actions = {
  showSnackbar({ commit }, snackbar) {
    commit('ADD_SNACKBAR', snackbar)
  },
  closeSnackbar({ commit }) {
    commit('REMOVE_SNACKBAR')
  },
  showBanner({ commit }, banner) {
    commit('ADD_BANNER', banner)
  },
  closeBanner({ commit }) {
    commit('REMOVE_BANNER')
  },

  error({ commit }, error) {
    if (error instanceof Error) {
      commit('ADD_SNACKBAR', {
        type: 'error',
        text: `${error.name}: ${error.message}`,
        action: 'RETRY',
        timeout: 5000
      })
    } else {
      // Alerta API error with status, code, message and errors.
      commit('ADD_BANNER', {
        type: 'error',
        text: `${error.code} Error: ${error.message}\n${error.errors}`
      })
    }
  }
}

const getters = {
  hasSnackbar: state => {
    return state.snackbars.length > 0
  },
  hasBanners: state => {
    return state.banners.length > 0
  }
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
