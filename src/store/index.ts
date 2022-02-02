import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import alerts from './modules/alerts.store'
import blackouts from './modules/blackouts.store'
import config from './modules/config.store'
import customers from './modules/customers.store'
import groups from './modules/groups.store'
import heartbeats from './modules/heartbeats.store'
import keys from './modules/keys.store'
import management from './modules/management.store'
import notifications from './modules/notifications.store'
import perms from './modules/perms.store'
import prefs from './modules/preferences.store'
import reports from './modules/reports.store'
import users from './modules/users.store'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

const mutations = {
  SET_SETTING(state, { s, v }) {
    state[s] = v
  }
}

const actions = {
  set({ commit }, [s, v]) {
    commit('SET_SETTING', { s, v })
  }
}

export const createStore = (): Store<any> => {
  return new Vuex.Store({
    state: {
      multiselect: false,
      refresh: false
    },
    mutations,
    actions,
    strict: debug,
    modules: {
      config,
      alerts,
      heartbeats,
      blackouts,
      users,
      groups,
      perms,
      customers,
      keys,
      reports,
      prefs,
      management,
      notifications
    }
  })
}

// FIXME: types...
export interface State {
  config?: any
  isKiosk: boolean
  isDark: boolean
  alerts?: any
  users?: any
  auth?: any
}
