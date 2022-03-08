import { IAlerts, IStore } from '@/store/interfaces'
import utils from '@/common/utils'
import AlertsApi from '@/services/api/alert.service'
import moment from 'moment'
import { Module } from 'vuex'

const state: IAlerts = {
  isLoading: false,
  isSearching: false,

  alerts: [],
  selected: [], // used by multi-select checkboxes
  environments: [],
  services: [],
  groups: [],
  tags: [],

  alert: undefined,
  notes: [],

  // not persisted
  isWatch: false,
  isKiosk: false,
  showPanel: false,
  displayDensity: 'comfortable',

  // query, filter and pagination
  query: new URLSearchParams(), // URLSearchParams
  filter: {
    // local defaults
    environment: null,
    text: null,
    status: ['open', 'ack'],
    customer: null,
    service: null,
    group: null,
    severity: null,
    dateRange: [null, null],
    owned: null
  },

  pagination: {
    itemsPerPage: 20,
    page: 1,
    sortBy: [],
    sortDesc: [],
    mustSort: false,
    groupBy: [],
    groupDesc: [],
    multiSort: false,
    itemsPerPageOptions: [5, 10, 20, 50, 100, 200],
    totalItems: 0
  }
}

const alerts: Module<IAlerts, IStore> = {
  namespaced: true,
  state,
  getters: {
    alerts: (state, _getters, rootState) => {
      if (!state.isWatch) return state.alerts
      return state.alerts.filter((a) =>
        a.tags.includes(`watch:${rootState.auth.payload.preferred_username}`)
      )
    },
    environments:
      (state, _getters, rootState) =>
      (showAllowedEnvs = true) =>
        (showAllowedEnvs
          ? [
              ...new Set([
                ...(rootState.config?.environments ?? []),
                ...state.environments.map((e) => e.environment)
              ])
            ]
          : state.environments.map((e) => e.environment)
        ).sort(),
    counts: (state) =>
      state.environments.reduce(
        (acc, e) => ({
          ...acc,
          [e.environment]: e.count,
          ALL: acc.ALL + e.count
        }),
        { ALL: 0 }
      ),
    services: (state) => state.services.map((s) => s.service).sort(),
    groups: (state) => state.groups.map((g) => g.group).sort(),
    tags: (state) => state.tags.map((t) => t.tag).sort(),
    getHash: (state) => {
      const filterHash = utils.toHash(state.filter)
      const sortBy = state.pagination.sortBy.length
        ? state.pagination.sortBy[0]
        : 'default'

      const descending = state.pagination.sortDesc[0] ? 1 : 0
      const paginationHash = `sb:${sortBy};sd:${descending}`
      const asiHash = `asi:${state.showPanel ? 1 : 0}`
      return `#${filterHash};${paginationHash};${asiHash}`
    }
  },
  mutations: {
    SET_LOADING: (state) => (state.isLoading = true),
    SET_SEARCH_QUERY: (state, query: IAlerts['query']) => {
      state.isSearching = true
      state.query = query
    },
    SET_ALERTS: (state, [alerts, total]) => {
      state.alerts = alerts
      state.pagination.totalItems = total
    },
    RESET_LOADING: (state) => {
      state.isLoading = false
      state.isSearching = false
    },
    SET_KIOSK: (state, isKiosk: IAlerts['isKiosk']) =>
      (state.isKiosk = isKiosk),
    SET_SELECTED: (state, selected: IAlerts['selected']) =>
      (state.selected = selected),
    SET_ALERT: (state, alert: IAlerts['alert']) => (state.alert = alert),
    SET_NOTES: (state, notes: IAlerts['notes']) => (state.notes = notes),
    SET_ENVIRONMENTS: (state, environments: IAlerts['environments']) =>
      (state.environments = environments),
    SET_SERVICES: (state, services: IAlerts['services']) =>
      (state.services = services),
    SET_GROUPS: (state, groups: IAlerts['groups']) => (state.groups = groups),
    SET_TAGS: (state, tags: IAlerts['tags']) => (state.tags = tags),
    SET_SETTING: (state, { s, v }) => (state[s] = v),
    SET_FILTER: (state, filter: IAlerts['filter']) =>
      Object.assign(state.filter, filter),
    SET_PAGINATION: (state, pagination: IAlerts['pagination']) =>
      Object.assign(state.pagination, pagination),
    SET_PANEL: (state, panel: IAlerts['showPanel']) => (state.showPanel = panel)
  },
  actions: {
    async getAlerts({ rootGetters, commit, state }) {
      commit('SET_LOADING')
      // get "lucene" query params (?q=)
      const params = new URLSearchParams(state.query)

      // append filter params to query params
      state.filter.environment &&
        params.append('environment', state.filter.environment)

      state.filter.status?.map((st) => params.append('status', st))
      state.filter.customer?.map((c) => params.append('customer', c))
      state.filter.service?.map((s) => params.append('service', s))
      state.filter.group?.map((g) => params.append('group', g))

      // add server-side sorting
      const sortBy = state.pagination.sortBy
        ? state.pagination.sortBy.map((s, i) =>
            state.pagination.sortDesc[i] ? `-${s}` : s
          )
        : [rootGetters.getConfig('sort_by')]

      sortBy.forEach((sb) => params.append('sort-by', sb))

      // need notes from alert history if showing notes icons
      if (rootGetters.getPreference('showNotesIcon'))
        params.append('show-history', 'true')

      // add server-side paging
      params.append('page', String(state.pagination.page))
      params.append('page-size', String(state.pagination.itemsPerPage))

      // apply any date/time filters
      if ((state.filter.dateRange[0] ?? 0) > 0) {
        params.append(
          'from-date',
          moment.unix(state.filter.dateRange[0] ?? 0).toISOString() // epoch seconds
        )
      } else if ((state.filter.dateRange[0] ?? 0) < 0) {
        params.append(
          'from-date',
          moment()
            .utc()
            .add(state.filter.dateRange[0] ?? 0, 'seconds')
            .toISOString() // seconds offset
        )
      }
      if ((state.filter.dateRange[1] ?? 0) > 0) {
        params.append(
          'to-date',
          moment.unix(state.filter.dateRange[1] ?? 0).toISOString() // epoch seconds
        )
      } else if ((state.filter.dateRange[1] ?? 0) < 0) {
        params.append(
          'to-date',
          moment()
            .utc()
            .add(state.filter.dateRange[1] ?? 0, 'seconds')
            .toISOString() // seconds offset
        )
      }

      return AlertsApi.getAlerts(params)
        .then(({ alerts, total }) => commit('SET_ALERTS', [alerts, total]))
        .finally(() => commit('RESET_LOADING'))
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
      return AlertsApi.getAlert(alertId)
        .then((alertRes) =>
          AlertsApi.getAlertIncident(alertId)
            .then((res) => ({
              ...alertRes.data.alert,
              incident: res.data.incident
            }))
            .catch(() => alertRes.data.alert)
        )
        .then((alert) => commit('SET_ALERT', alert))
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
      state.filter.status?.map((st) => params.append('status', st))
      state.filter.customer?.map((c) => params.append('customer', c))
      state.filter.service?.map((s) => params.append('service', s))
      state.filter.group?.map((g) => params.append('group', g))

      // apply any date/time filters
      if ((state.filter.dateRange[0] ?? 0) > 0) {
        params.append(
          'from-date',
          moment.unix(state.filter.dateRange[0] ?? 0).toISOString() // epoch seconds
        )
      } else if ((state.filter.dateRange[0] ?? 0) < 0) {
        params.append(
          'from-date',
          moment()
            .utc()
            .add(state.filter.dateRange[0] ?? 0, 'seconds')
            .toISOString() // seconds offset
        )
      }
      if ((state.filter.dateRange[1] ?? 0) > 0) {
        params.append(
          'to-date',
          moment.unix(state.filter.dateRange[1] ?? 0).toISOString() // epoch seconds
        )
      } else if ((state.filter.dateRange[1] ?? 0) < 0) {
        params.append(
          'to-date',
          moment()
            .utc()
            .add(state.filter.dateRange[1] ?? 0, 'seconds')
            .toISOString() // seconds offset
        )
      }

      return AlertsApi.getEnvironments(params).then(
        (res) => res && commit('SET_ENVIRONMENTS', res.environments)
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
      commit('SET_FILTER', rootState.config?.filter)
    },
    setPagination({ commit }, pagination) {
      commit('SET_PAGINATION', pagination)
    },
    setPanel({ commit }, panel) {
      commit('SET_PANEL', panel)
    }
  }
}

export default alerts
