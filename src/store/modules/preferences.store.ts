import i18n from '@/plugins/i18n'
import UsersApi from '@/services/api/user.service'
import stateMerge from 'vue-object-merge'

const getDefaults = () => {
  return {
    isDark: false,
    isMute: true,
    languagePref: i18n.locale,
    audioURL: './audio/alert_high-intensity.ogg',
    dates: {
      longDate: null,
      mediumDate: null,
      shortTime: null
    },
    timezone: 'local', // 'local' or 'utc'
    displayDensity: null, // 'comfortable' or 'compact'
    showAllowedEnvs: false,
    showNotesIcon: false,
    font: {
      'font-family': null,
      'font-size': null,
      'font-weight': null
    },
    itemsPerPage: 20,
    valueWidth: 50, // px
    textWidth: 400, // px
    refreshInterval: 5 * 1000, // milliseconds
    ackTimeout: null,
    shelveTimeout: null,
    blackoutStartNow: true,
    blackoutPeriod: null,
    queries: []
  }
}

const state = getDefaults()

const mutations = {
  SET_PREFS(state, prefs) {
    stateMerge(state, prefs)
  },
  RESET_PREFS(state) {
    const q = state.queries
    Object.assign(state, getDefaults())
    stateMerge(state, { queries: q })
  },
  SET_QUERIES(state, queries) {
    stateMerge(state, { queries: queries || [] })
  },
  RESET_QUERIES(state) {
    Object.assign(state, { queries: [] })
  }
}

const actions = {
  async getUserPrefs({ dispatch, commit }) {
    return UsersApi.getMeAttributes()
      .then(({ attributes }) => {
        commit('SET_PREFS', attributes.prefs)
      })
      .catch(() =>
        dispatch('notifications/error', Error(`${i18n.t('SettingsError')}`), {
          root: true
        })
      )
  },
  async toggle({ dispatch }, [s, v]) {
    return UsersApi.updateMeAttributes({ prefs: { [s]: v } })
      .then(() => dispatch('getUserPrefs'))
      .then(() =>
        dispatch('notifications/success', i18n.t('SettingsSaved'), {
          root: true
        })
      )
  },
  async setUserPrefs({ dispatch }, prefs) {
    return UsersApi.updateMeAttributes({ prefs })
      .then(() => dispatch('getUserPrefs'))
      .then(() =>
        dispatch('notifications/success', i18n.t('SettingsSaved'), {
          root: true
        })
      )
  },
  async resetUserPrefs({ dispatch, commit }) {
    return UsersApi.updateMeAttributes({ prefs: null })
      .then(() => commit('RESET_PREFS'))
      .then(() =>
        dispatch('notifications/success', i18n.t('SettingsReset'), {
          root: true
        })
      )
  },
  clearUserPrefs({ commit }) {
    commit('RESET_PREFS')
  },
  async getUserQueries({ dispatch, commit }) {
    return UsersApi.getMeAttributes()
      .then(({ attributes }) => {
        commit('SET_QUERIES', attributes.queries)
      })
      .catch(() =>
        dispatch('notifications/error', Error(`${i18n.t('SettingsError')}`), {
          root: true
        })
      )
  },
  async addUserQuery({ dispatch, state }, query) {
    const qlist = state.queries
      .filter((q) => q.text != query.text)
      .concat([query])
    return UsersApi.updateMeAttributes({ queries: qlist })
      .then(() => dispatch('getUserQueries'))
      .then(() =>
        dispatch('notifications/success', i18n.t('SettingsSaved'), {
          root: true
        })
      )
  },
  async removeUserQuery({ dispatch, state }, query) {
    const qlist = state.queries.filter((q) => q.text != query.text)
    return UsersApi.updateMeAttributes({ queries: qlist })
      .then(() => dispatch('getUserQueries'))
      .then(() =>
        dispatch('notifications/success', i18n.t('SettingsSaved'), {
          root: true
        })
      )
  },
  async resetUserQueries({ dispatch, commit }) {
    return UsersApi.updateMeAttributes({ queries: null })
      .then(() => commit('RESET_QUERIES'))
      .then(() =>
        dispatch('notifications/success', i18n.t('SettingsReset'), {
          root: true
        })
      )
  }
}

const getters = {
  getPreference: (state) => (pref) => {
    return state[pref]
  },
  getUserQueries: (state) => {
    return state.queries ? state.queries : []
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
