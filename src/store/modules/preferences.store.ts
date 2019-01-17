import UsersApi from '@/services/api/user.service'
import stateMerge from 'vue-object-merge'

const state = {
  isDark: false,
  isMute: false,
  dates: {
    longDate: null,
    mediumDate: null,
    shortTime: null
  },
  refreshInterval: null,
  shelveTimeout: 2 // hours
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
      .catch(error => dispatch('notifications/error', error, { root: true }))
  },
  toggle({ dispatch, commit }, [s, v]) {
    return UsersApi.updateMeAttributes({ prefs: { [s]: v } })
      .then(response => dispatch('getUserPrefs'))
      .catch(error => dispatch('notifications/error', error, { root: true }))
  },
  setUserPrefs({ dispatch, commit }, prefs) {
    return UsersApi.updateMeAttributes({ prefs: prefs })
      .then(response => {
        dispatch('getUserPrefs')
      })
      .catch(error => dispatch('notifications/error', error, { root: true }))
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
