import { IStore } from '@/common/interfaces'
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
import incidents from './modules/incidents.store'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export const createStore = () =>
  new Store<IStore>({
    state: {
      multiselect: false,
      refresh: false
    },
    mutations: {
      SET_SETTING(state, { s, v }) {
        state[s] = v
      }
    },
    actions: {
      set({ commit }, [s, v]) {
        commit('SET_SETTING', { s, v })
      }
    },
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
      notifications,
      incidents
    }
  })
