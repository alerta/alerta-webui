import { Banner, INotifications, IStore, Snackbar } from '@/store/interfaces'
import { Module } from 'vuex'

const state: INotifications = {
  snackbars: [],
  banners: []
}

const notifications: Module<INotifications, IStore> = {
  namespaced: true,
  state,
  mutations: {
    ADD_SNACKBAR(state, snackbar: Snackbar) {
      // depdupe incoming snackbars
      if (state.snackbars.find((s) => s.text === snackbar.text)) return
      state.snackbars.push(snackbar)
    },
    REMOVE_SNACKBAR(state) {
      state.snackbars.shift()
    },
    ADD_BANNER(state, banner: Banner) {
      // depdupe incoming banners
      if (state.banners.find((s) => s.text === banner.text)) return
      state.banners.push(banner)
    },
    REMOVE_BANNER(state) {
      state.banners.shift()
    }
  },
  actions: {
    showSnackbar: ({ commit }, snackbar: Snackbar) =>
      commit('ADD_SNACKBAR', snackbar),
    closeSnackbar: ({ commit }) => commit('REMOVE_SNACKBAR'),
    showBanner: ({ commit }, banner: Banner) => commit('ADD_BANNER', banner),
    closeBanner: ({ commit }) => commit('REMOVE_BANNER'),
    success: ({ commit }, message: string) =>
      commit('ADD_SNACKBAR', {
        type: 'success',
        text: message,
        action: 'OK',
        timeout: 3000
      }),
    custom: ({ commit }, snackbar: Snackbar) =>
      commit('ADD_SNACKBAR', snackbar),
    error: ({ commit }, error) =>
      // HTTP error with status, code, message and errors.
      commit('ADD_SNACKBAR', {
        type: error.status,
        text: error.hasOwnProperty('code')
          ? `${error.message} (${error.code})`
          : `${error.name}: ${error.message}`,
        action: 'CLOSE',
        timeout: 5000
      })
  },
  getters: {
    hasSnackbar: (state) => state.snackbars.length > 0,
    hasBanners: (state) => state.banners.length > 0
  }
}

export default notifications
