import utils from '@/common/utils'
import AlertsApi from '@/services/api/alert.service'
import moment from 'moment'
import { DataPagination } from 'vuetify'

const namespaced = true

interface AlertsState {
  isLoading: boolean
  isSearching: boolean

  alerts: any[]
  selected: any[]
  environments: any[]
  services: any[]
  groups: any[]
  tags: any[]

  alert: any
  notes: any[]

  isWatch: boolean
  isKiosk: boolean
  showPanel: boolean
  displayDensity: 'comfortable' | 'compact'

  query: any // URLSearchParams
  filter: any

  pagination: DataPagination
}

const state: AlertsState = {
  isLoading: false,
  isSearching: false,

  alerts: [],
  selected: [], // used by multi-select checkboxes
  environments: [],
  services: [],
  groups: [],
  tags: [],

  alert: {},
  notes: [],

  // not persisted
  isWatch: false,
  isKiosk: false,
  showPanel: false,
  displayDensity: 'comfortable', // 'comfortable' or 'compact'

  // query, filter and pagination
  query: {}, // URLSearchParams
  filter: {
    // local defaults
    environment: null,
    text: null,
    status: ['open', 'ack'],
    customer: null,
    service: null,
    group: null,
    dateRange: [null, null]
  },

  pagination: {
    itemsPerPage: 20,
    page: 1,
    sortBy: 'default',
    sortDesc: [false],
    itemsPerPageOptions: [5, 10, 20, 50, 100, 200]
  }
}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_SEARCH_QUERY(state, query) {
    state.isSearching = true
    state.query = query
  },
  SET_ALERTS(state, [alerts, total, pageSize]) {
    state.isLoading = false
    state.isSearching = false
    state.alerts = alerts
    state.pagination.totalItems = total
    state.pagination.rowsPerPage = pageSize
  },
  RESET_LOADING(state) {
    state.isLoading = false
    state.isSearching = false
  },
  SET_KIOSK(state, isKiosk) {
    state.isKiosk = isKiosk
  },
  SET_SELECTED(state, selected) {
    state.selected = selected
  },
  SET_ALERT(state, alert) {
    state.alert = alert
  },
  SET_NOTES(state, notes) {
    state.notes = notes
  },
  SET_ENVIRONMENTS(state, environments) {
    state.environments = environments
  },
  SET_SERVICES(state, services) {
    state.services = services
  },
  SET_GROUPS(state, groups) {
    state.groups = groups
  },
  SET_TAGS(state, tags) {
    state.tags = tags
  },
  SET_SETTING(state, { s, v }) {
    state[s] = v
  },
  SET_FILTER(state, filter) {
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
  async getAlerts({ rootGetters, commit, state }) {
    commit('SET_LOADING')
    // get "lucene" query params (?q=)
    const params = new URLSearchParams(state.query)

    // append filter params to query params
    state.filter.environment &&
      params.append('environment', state.filter.environment)
    state.filter.status &&
      state.filter.status.map((st) => params.append('status', st))
    state.filter.customer &&
      state.filter.customer.map((c) => params.append('customer', c))
    state.filter.service &&
      state.filter.service.map((s) => params.append('service', s))
    state.filter.group &&
      state.filter.group.map((g) => params.append('group', g))

    // add server-side sorting
    let sortBy = state.pagination.sortBy
    if (sortBy === 'default' || !sortBy) {
      sortBy = rootGetters['getConfig']('sort_by')
    }

    if (typeof sortBy === 'string') {
      params.append(
        'sort-by',
        (state.pagination.descending ? '-' : '') + sortBy
      )
    } else {
      sortBy.map((sb) => params.append('sort-by', sb))
    }

    // need notes from alert history if showing notes icons
    if (rootGetters.getPreference('showNotesIcon')) {
      params.append('show-history', 'true')
    }

    // add server-side paging
    params.append('page', state.pagination.page)
    params.append('page-size', state.pagination.rowsPerPage)

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
      .then(({ alerts, total, pageSize }) =>
        commit('SET_ALERTS', [alerts, total, pageSize])
      )
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

  async getAlert({ commit }, alertId) {
    return AlertsApi.getAlert(alertId).then(({ alert }) => {
      commit('SET_ALERT', alert)
    })
  },

  async watchAlert({ rootState }, alertId) {
    const username = rootState.auth.payload.preferred_username
    const tag = `watch:${username}`
    return AlertsApi.tagAlert(alertId, { tags: [tag] })
  },
  async unwatchAlert({ rootState }, alertId) {
    const username = rootState.auth.payload.preferred_username
    const tag = `watch:${username}`
    return AlertsApi.untagAlert(alertId, { tags: [tag] })
  },
  async takeAction({}, [alertId, action, text, timeout]) {
    return AlertsApi.actionAlert(alertId, {
      action,
      text,
      timeout
    })
  },
  async tagAlert({}, [alertId, tags]) {
    return AlertsApi.tagAlert(alertId, tags)
  },
  async untagAlert({}, [alertId, tags]) {
    return AlertsApi.untagAlert(alertId, tags)
  },

  async addNote({ dispatch }, [alertId, text]) {
    return AlertsApi.addNote(alertId, {
      text
    }).then(() => dispatch('getAlerts'))
  },
  async getNotes({ commit }, alertId) {
    return AlertsApi.getNotes(alertId).then(({ notes }) => {
      commit('SET_NOTES', notes)
    })
  },
  async updateNote({ dispatch }, [alertId, noteId, note]) {
    return AlertsApi.updateNote(alertId, noteId, {
      note
    }).then(() => dispatch('getNotes'))
  },
  async deleteNote({ dispatch }, [alertId, noteId]) {
    return AlertsApi.deleteNote(alertId, noteId).then(() =>
      dispatch('getNotes', [alertId])
    )
  },

  async deleteAlert({}, alertId) {
    return AlertsApi.deleteAlert(alertId)
  },

  async getEnvironments({ commit, state }) {
    // get "lucene" query params (?q=)
    const params = new URLSearchParams(state.query)

    // append filter params to query params
    state.filter.status &&
      state.filter.status.map((st) => params.append('status', st))
    state.filter.customer &&
      state.filter.customer.map((c) => params.append('customer', c))
    state.filter.service &&
      state.filter.service.map((s) => params.append('service', s))
    state.filter.group &&
      state.filter.group.map((g) => params.append('group', g))

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

    return AlertsApi.getEnvironments(params).then(({ environments }) =>
      commit('SET_ENVIRONMENTS', environments)
    )
  },
  async getServices({ commit }) {
    return AlertsApi.getServices({}).then(({ services }) =>
      commit('SET_SERVICES', services)
    )
  },
  async getGroups({ commit }) {
    return AlertsApi.getGroups({}).then(({ groups }) =>
      commit('SET_GROUPS', groups)
    )
  },
  async getTags({ commit }) {
    return AlertsApi.getTags({}).then(({ tags }) => commit('SET_TAGS', tags))
  },

  toggle({ commit }, [s, v]) {
    commit('SET_SETTING', { s, v })
  },
  set({ commit }, [s, v]) {
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
  alerts: (state, _getters, rootState) => {
    if (state.isWatch) {
      const username = rootState.auth.payload.preferred_username
      const tag = `watch:${username}`
      return state.alerts.filter((a) => a.tags.includes(tag))
    } else {
      return state.alerts
    }
  },
  environments:
    (state, _getters, rootState) =>
    (showAllowedEnvs = true) => {
      if (showAllowedEnvs) {
        return [
          ...new Set([
            ...(rootState.config.environments || []),
            ...state.environments.map((e) => e.environment)
          ])
        ].sort()
      }
      return state.environments.map((e) => e.environment).sort()
    },
  counts: (state) => {
    return state.environments.reduce(
      (grp, e) => {
        grp[e.environment] = e.count
        grp['ALL'] = grp['ALL'] + e.count
        return grp
      },
      { ALL: 0 }
    )
  },
  services: (state) => {
    return state.services.map((s) => s.service).sort()
  },
  groups: (state) => {
    return state.groups.map((g) => g.group).sort()
  },
  tags: (state) => {
    return state.tags.map((t) => t.tag).sort()
  },
  getHash: (state) => {
    const filterHash = utils.toHash(state.filter)
    const sortBy = state.pagination.sortBy ? state.pagination.sortBy : 'default'
    const descending = state.pagination.descending ? 1 : 0
    const paginationHash = `sb:${sortBy};sd:${descending}`
    const asiHash = `asi:${state.showPanel ? 1 : 0}`
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
