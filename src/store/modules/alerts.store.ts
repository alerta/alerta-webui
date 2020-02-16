import AlertsApi from '@/services/api/alert.service'

import moment from 'moment'
import utils from '@/common/utils'

const namespaced = true

const state = {
  isLoading: false,

  alerts: [],
  selected: [], // used by multi-select checkboxes
  environments: [],
  services: [],
  groups: [],
  tags: [],

  alert: {},

  offenders: [],
  flapping: [],
  standing: [],

  // not persisted
  isWatch: false,
  isKiosk: false,
  showPanel: false,

  // query, filter and pagination
  query: {}, // URLSearchParams
  filter: {  // local defaults
    environment: null,
    text: null,
    status: ['open', 'ack'],
    customer: null,
    service: null,
    group: null,
    dateRange: [null, null]
  },

  pagination: {
    descending: true,
    page: 1,
    rowsPerPage: 20,
    sortBy: 'default',
    totalItems: 0,
    rowsPerPageItems: [10, 20, 30, 40, 50]
  }
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
  SET_TOP_OFFENDERS(state, top10): any {
    state.offenders = top10
  },
  SET_TOP_FLAPPING(state, top10): any {
    state.flapping = top10
  },
  SET_TOP_STANDING(state, top10): any {
    state.standing = top10
  },
  SET_SETTING(state, { s, v }) {
    state[s] = v
  },
  SET_FILTER(state, filter): any {
    state.filter = Object.assign({}, state.filter, filter)
  },
  SET_PAGINATION(state, pagination) {
    state.pagination = Object.assign({}, state.pagination, pagination)
  },
  SET_PANEL(state, panel) {
    state.showPanel = panel
  }
}

const actions = {
  getAlerts({ rootGetters, commit, state }) {
    commit('SET_LOADING')
    // get "lucene" query params and sort order
    let params = new URLSearchParams(state.query)
    let sortBy = rootGetters['getConfig']('sort_by')
    params.append('sort-by', sortBy.replace(/^\-/,''))
    if (sortBy.startsWith('-')) {
      params.append('reverse', '1')
    }

    // append filter params to query params
    state.filter.status && state.filter.status.map(st => params.append('status', st))
    state.filter.customer && state.filter.customer.map(c => params.append('customer', c))
    state.filter.service && state.filter.service.map(s => params.append('service', s))
    state.filter.group && state.filter.group.map(g => params.append('group', g))

    // apply any date/time filters
    if (state.filter.dateRange[0] > 0) {
      params.append(
        'from-date',
        moment.unix(state.filter.dateRange[0]).toISOString() // epoch seconds
      )
    } else if (state.filter.dateRange[0] < 0) {
      params.append(
        'from-date',
        moment().utc().add(state.filter.dateRange[0], 'seconds').toISOString() // seconds offset
      )
    }
    if (state.filter.dateRange[1] > 0) {
      params.append(
        'to-date',
        moment.unix(state.filter.dateRange[1]).toISOString() // epoch seconds
      )
    } else if (state.filter.dateRange[1] < 0) {
      params.append(
        'to-date',
        moment().utc().add(state.filter.dateRange[1], 'seconds').toISOString() // seconds offset
      )
    }

    return AlertsApi.getAlerts(params)
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

  watchAlert({ commit, dispatch, rootState}, alertId) {
    const username = rootState.auth.payload.preferred_username
    const tag = `watch:${username}`
    return AlertsApi.tagAlert(alertId, {tags: [tag]}).then(response =>
      dispatch('getAlerts')
    )
  },
  unwatchAlert({ commit, dispatch, rootState}, alertId) {
    const username = rootState.auth.payload.preferred_username
    const tag = `watch:${username}`
    return AlertsApi.untagAlert(alertId, {tags: [tag]}).then(response =>
      dispatch('getAlerts')
    )
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

  getTopOffenders({ commit }) {
    return AlertsApi.getTop10Count({}).then(({ top10 }) => commit('SET_TOP_OFFENDERS', top10))
  },
  getTopFlapping({ commit }) {
    return AlertsApi.getTop10Flapping({}).then(({ top10 }) => commit('SET_TOP_FLAPPING', top10))
  },
  getTopStanding({ commit }) {
    return AlertsApi.getTop10Standing({}).then(({ top10 }) => commit('SET_TOP_STANDING', top10))
  },

  toggle({ commit }, [s, v]) {
    commit('SET_SETTING', { s, v })
  },
  setFilter({ commit }, filter) {
    commit('SET_FILTER', filter)
  },
  resetFilter({ commit, rootState }) {
    commit('SET_FILTER', rootState.config.filter)
  },
  setPagination({ commit }, pagination) {
    commit('SET_PAGINATION', pagination)
  },
  setPanel({ commit }, panel) {
    commit('SET_PANEL', panel)
  }
}

const getters = {
  alerts: (state, getters, rootState) => {
    if (state.isWatch) {
      const username = rootState.auth.payload.preferred_username
      const tag = `watch:${username}`
      return state.alerts.filter(a => a.tags.includes(tag))
    } else {
      return state.alerts
    }
  },
  environments: state => {
    return state.environments.map(e => e.environment).sort()
  },
  services: state => {
    return state.services.map(s => s.service).sort()
  },
  groups: state => {
    return state.groups.map(g => g.group).sort()
  },
  tags: state => {
    return state.tags.map(t => t.tag).sort()
  },
  getHash: state => {
    let filterHash = utils.toHash(state.filter)
    let paginationHash = `sb:${state.pagination.sortBy};sd:${state.pagination.descending ? 1 : 0 }`
    let asiHash = `asi:${state.showPanel ? 1 : 0 }`
    return `#${filterHash};${paginationHash};${asiHash}`
  }
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
