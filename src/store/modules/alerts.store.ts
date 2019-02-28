import AlertsApi from '@/services/api/alert.service'

const namespaced = true

const state = {
  isLoading: false,

  alerts: [],
  selected: [],
  query: {}, // 'q' query string syntax eg. {"q": "severity:critical"}
  environments: [],
  services: [],
  groups: [],
  tags: [],

  alert: {},

  // not persisted
  isWatch: false,
  isKiosk: false
}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_ALERTS(state, alerts): any {
    state.isLoading = false
    state.alerts = alerts
  },
  RESET_LOADING(state) {
    state.isLoading = false
  },
  SET_SEARCH_QUERY(state, query): any {
    state.query = query
  },
  SET_KIOSK(state, isKiosk): any {
    state.isKiosk = isKiosk
  },
  SET_SELECTED(state, selected) {
    state.selected = selected
  },
  SET_ALERT(state, alert): any {
    state.alert = alert
  },
  SET_ENVIRONMENTS(state, environments): any {
    state.environments = environments
  },
  SET_SERVICES(state, services): any {
    state.services = services
  },
  SET_GROUPS(state, groups): any {
    state.groups = groups
  },
  SET_TAGS(state, tags): any {
    state.tags = tags
  },
  SET_SETTING(state, { s, v }) {
    state[s] = v
  }
}

const actions = {
  getAlerts({ commit, state }) {
    commit('SET_LOADING')
    return AlertsApi.getAlerts(state.query)
      .then(({ alerts }) => commit('SET_ALERTS', alerts))
      .catch(() => commit('RESET_LOADING'))
  },
  updateQuery({ commit }, query) {
    commit('SET_SEARCH_QUERY', query)
  },
  updateKiosk({ commit }, isKiosk) {
    commit('SET_KIOSK', isKiosk)
  },
  updateSelected({ commit }, selected) {
    commit('SET_SELECTED', selected)
  },

  getAlert({ commit }, alertId) {
    return AlertsApi.getAlert(alertId).then(({ alert }) => {
      commit('SET_ALERT', alert)
    })
  },

  takeAction({ commit, dispatch }, [alertId, action, text, timeout]) {
    return AlertsApi.actionAlert(alertId, {
      action: action,
      text: text,
      timeout: timeout
    }).then(response => dispatch('getAlerts'))
  },
  tagAlert({ commit, dispatch }, [alertId, tags]) {
    return AlertsApi.tagAlert(alertId, tags).then(response =>
      dispatch('getAlerts')
    )
  },
  untagAlert({ commit, dispatch }, [alertId, tags]) {
    return AlertsApi.untagAlert(alertId, tags).then(response =>
      dispatch('getAlerts')
    )
  },
  addNote({ commit, dispatch }, [alertId, note]) {
    return AlertsApi.addNote(alertId, {
      note: note
    }).then(response => dispatch('getAlerts'))
  },
  deleteAlert({ commit, dispatch }, alertId) {
    return AlertsApi.deleteAlert(alertId).then(response =>
      dispatch('getAlerts')
    )
  },

  getEnvironments({ commit }) {
    return AlertsApi.getEnvironments({}).then(({ environments }) =>
      commit('SET_ENVIRONMENTS', environments)
    )
  },
  getServices({ commit }) {
    return AlertsApi.getServices({}).then(({ services }) =>
      commit('SET_SERVICES', services)
    )
  },
  getGroups({ commit }) {
    return AlertsApi.getGroups({}).then(({ groups }) => commit('SET_GROUPS', groups))
  },
  getTags({ commit }) {
    return AlertsApi.getTags({}).then(({ tags }) => commit('SET_TAGS', tags))
  },
  toggle({ commit }, [s, v]) {
    commit('SET_SETTING', { s, v })
  }
}

const getters = {
  alerts: (state, getters, rootState) => {
    if (state.isWatch) {
      let user = rootState.auth.payload.name
      return state.alerts.filter(a => a.tags.includes(`watch:${user}`))
    } else {
      return state.alerts
    }
  },
  environments: state => {
    return state.environments.map(e => e.environment)
  },
  services: state => {
    return state.services.map(s => s.service).sort()
  },
  groups: state => {
    return state.groups.map(g => g.group).sort()
  },
  tags: state => {
    return state.tags.map(t => t.tag).sort()
  }
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
