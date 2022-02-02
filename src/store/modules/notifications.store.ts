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
    if (!state.snackbars.map((s) => s.text).includes(snackbar.text)) {
      state.snackbars.push(snackbar)
    }
  },
  REMOVE_SNACKBAR(state) {
    state.snackbars.shift()
  },
  ADD_BANNER(state, banner) {
    if (!state.banners.map((b) => b.text).includes(banner.text)) {
      state.banners.push(banner)
    }
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

  success({ commit }, message) {
    commit('ADD_SNACKBAR', {
      type: 'success',
      text: message,
      action: 'OK',
      timeout: 3000
    })
  },

  error({ commit }, error) {
    // HTTP error with status, code, message and errors.
    if (error.hasOwnProperty('code')) {
      commit('ADD_SNACKBAR', {
        type: error.status,
        text: `${error.message} (${error.code})`,
        action: 'CLOSE',
        timeout: 5000
      })
    } else {
      commit('ADD_SNACKBAR', {
        type: 'error',
        text: `${error.name}: ${error.message}`,
        action: 'CLOSE',
        timeout: 5000
      })
    }
  }
}

const getters = {
  hasSnackbar: (state) => {
    return state.snackbars.length > 0
  },
  hasBanners: (state) => {
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
