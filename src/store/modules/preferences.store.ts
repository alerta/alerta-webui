import UsersApi from '@/services/api/user.service'
import i18n from '@/plugins/i18n'

const getDefaults = () => {
  return {
    isDark: false,
    isMute: true,
    languagePref: i18n.global.locale,
    audioURL: './audio/alert_high-intensity.ogg',
    dates: {
      longDate: null,
      mediumDate: null,
      shortTime: null
    },
    timezone: 'local', // 'local' or 'utc'
    displayDensity: null, // 'comfortable' or 'compact'
    showAllowedEnvs: false,
    show/**/NotesIcon: false,
    font: {
      'font-family': null,
      'font-size': null,
      'font-weight': null
    },
    rowsPerPage: 20,
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
    //stateMerge(state, prefs)
    state.prefs = prefs
  },
  RESET_PREFS(state) {
    let q = state.queries
    Object.assign(state, getDefaults())
    //stateMerge(state, {queries: q})
    state.queries = q
  },
  SET_QUERIES(state, queries) {
    //stateMerge(state, {queries: queries || []})
    state.queries = queries || []
  },
  RESET_QUERIES(state) {
    Object.assign(state, {queries: []})
  }
}

const actions = {
  getUserPrefs({dispatch, commit}) {
    return UsersApi.getMeAttributes()
      .then(({attributes}) => {
        commit('SET_PREFS', attributes.prefs)
      })
      .catch(error =>
        dispatch('notifications/error', Error('' + i18n.global.t('SettingsError')), {
          root: true
        })
      )
  },
  toggle({dispatch, commit}, [s, v]) {
    return UsersApi.updateMeAttributes({prefs: {[s]: v}})
      .then(response => dispatch('getUserPrefs'))
      .then(() =>
        dispatch('notifications/success', i18n.global.t('SettingsSaved'), {
          root: true
        })
      )
  },
  setUserPrefs({dispatch, commit}, prefs) {
    return UsersApi.updateMeAttributes({prefs: prefs})
      .then(response => dispatch('getUserPrefs'))
      .then(() =>
        dispatch('notifications/success', i18n.global.t('SettingsSaved'), {
          root: true
        })
      )
  },
  resetUserPrefs({dispatch, commit}) {
    return UsersApi.updateMeAttributes({prefs: null})
      .then(response => commit('RESET_PREFS'))
      .then(() =>
        dispatch('notifications/success', i18n.global.t('SettingsReset'), {
          root: true
        })
      )
  },
  clearUserPrefs({commit}) {
    commit('RESET_PREFS')
  },
  getUserQueries({dispatch, commit}) {
    return UsersApi.getMeAttributes()
      .then(({attributes}) => {
        commit('SET_QUERIES', attributes.queries)
      })
      .catch(error =>
        dispatch('notifications/error', Error('' + i18n.global.t('SettingsError')), {
          root: true
        })
      )
  },
  addUserQuery({dispatch, state}, query) {
    let qlist = state.queries.filter(q => q.text != query.text).concat([query])
    return UsersApi.updateMeAttributes({queries: qlist})
      .then(response => dispatch('getUserQueries'))
      .then(() =>
        dispatch('notifications/success', i18n.global.t('SettingsSaved'), {
          root: true
        })
      )
  },
  removeUserQuery({dispatch, state}, query) {
    let qlist = state.queries.filter(q => q.text != query.text)
    return UsersApi.updateMeAttributes({queries: qlist})
      .then(response => dispatch('getUserQueries'))
      .then(() =>
        dispatch('notifications/success', i18n.global.t('SettingsSaved'), {
          root: true
        })
      )
  },
  resetUserQueries({dispatch, commit}) {
    return UsersApi.updateMeAttributes({queries: null})
      .then(response => commit('RESET_QUERIES'))
      .then(() =>
        dispatch('notifications/success', i18n.global.t('SettingsReset'), {
          root: true
        })
      )
  }
}

const getters = {
  getPreference: state => pref => {
    return state[pref]
  },
  getUserQueries: state => {
    return state.queries ? state.queries : []
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
