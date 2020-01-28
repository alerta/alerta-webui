import UsersApi from '@/services/api/user.service'
import stateMerge from 'vue-object-merge'
import i18n from '@/plugins/i18n'

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
    timezone: 'local',  // 'local' or 'utc'
    displayDensity: 'comfortable',  // 'comfortable' or 'compact'
    rowsPerPage: 20,
    refreshInterval: 5*1000,  // milliseconds
    shelveTimeout: 2*60*60  // seconds
  }
}

const state = getDefaults()

const mutations = {
  SET_PREFS(state, prefs) {
    stateMerge(state, prefs)
  },
  RESET_PREFS(state) {
    Object.assign(state, getDefaults())
  }
}

const actions = {
  getUserPrefs({ dispatch, commit }) {
    return UsersApi.getMeAttributes()
      .then(({ attributes }) =>  {
        //i18n.locale = attributes.prefs.languagePref
        commit('SET_PREFS', attributes.prefs)
      })
      .catch((error) => dispatch('notifications/error', Error('' + i18n.t('SettingsError')), { root: true }))
  },
  toggle({ dispatch, commit }, [s, v]) {
    return UsersApi.updateMeAttributes({ prefs: { [s]: v } })
      .then(response => dispatch('getUserPrefs'))
      .then(() => dispatch('notifications/success', i18n.t('SettingsSaved'), { root: true }))
  },
  setUserPrefs({ dispatch, commit }, prefs) {
    return UsersApi.updateMeAttributes({ prefs: prefs })
      .then(response => dispatch('getUserPrefs'))
      .then(() => dispatch('notifications/success', i18n.t('SettingsSaved'), { root: true }))
  },
  resetUserPrefs({ dispatch, commit }) {
    return UsersApi.updateMeAttributes({ prefs: null })
      .then(response => commit('RESET_PREFS'))
      .then(() => dispatch('notifications/success', i18n.t('SettingsReset'), { root: true }))
  }

}

const getters = {
  getPreference: state => pref => {
    return state[pref]
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
