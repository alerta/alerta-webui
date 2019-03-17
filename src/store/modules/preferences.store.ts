import UsersApi from '@/services/api/user.service'
import stateMerge from 'vue-object-merge'

const state = {
  isDark: false,
  isMute: false,
  dates: {
    longDate: 'ddd D MMM, YYYY HH:mm:ss.SSS Z',
    mediumDate: 'ddd D MMM HH:mm',
    shortTime: 'LT'
  },
  refreshInterval: 5*1000,
  shelveTimeout: 2*60*60
}

const mutations = {
  SET_PREFS(state, prefs) {
    stateMerge(state, prefs)
  }
}

const actions = {
  getUserPrefs({ dispatch, commit }) {
    return UsersApi.getMeAttributes()
      .then(({ attributes }) => commit('SET_PREFS', attributes.prefs))
  },
  toggle({ dispatch, commit }, [s, v]) {
    return UsersApi.updateMeAttributes({ prefs: { [s]: v } })
      .then(response => dispatch('getUserPrefs'))
      .then(() => dispatch('notifications/success', 'Settings saved.', { root: true }))
  },
  setUserPrefs({ dispatch, commit }, prefs) {
    return UsersApi.updateMeAttributes({ prefs: prefs })
      .then(response => dispatch('getUserPrefs'))
      .then(() => dispatch('notifications/success', 'Settings saved.', { root: true }))
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
