import { IIncidents, IStore } from '@/store/interfaces'
import utils from '@/common/utils'
import IncidentsApi from '@/services/api/incident.service'
import moment from 'moment'
import { Module } from 'vuex'
import { IIncident } from '@/common/interfaces'

const state: IIncidents = {
  isLoading: false,
  isSearching: false,

  incidents: [],
  selected: [], // used by multi-select checkboxes
  environments: [],
  services: [],
  groups: [],
  tags: [],

  incident: null,
  notes: [],

  // not persisted
  isWatch: false,
  isKiosk: false,
  showPanel: false,
  displayDensity: 'comfortable', // 'comfortable' or 'compact'

  // query, filter and pagination
  query: new URLSearchParams(), // URLSearchParams
  filter: {
    // local defaults
    severity: null,
    environment: null,
    text: null,
    status: ['open', 'ack'],
    customer: null,
    service: null,
    group: null,
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

const incidents: Module<IIncidents, IStore> = {
  namespaced: true,
  state,
  getters: {
    incidents: (state, _getters, rootState) => {
      if (!state.isWatch) return state.incidents
      const username = rootState.auth.payload.preferred_username
      const tag = `watch:${username}`
      return state.incidents.filter((i) => i.tags.includes(tag))
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
        (grp, e) => ({
          [e.environment]: e.count,
          ALL: grp['ALL'] + e.count
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
    SET_SEARCH_QUERY: (state, query: IIncidents['query']) => {
      state.isSearching = true
      state.query = query
    },
    SET_INCIDENTS: (state, [incidents, total, pageSize]) => {
      state.incidents = incidents
      state.pagination.totalItems = total
      state.pagination.itemsPerPage = pageSize
    },
    SET_INCIDENT: (state, incident: IIncidents['incident']) => {
      state.incident = incident
    },
    RESET_LOADING: (state) => {
      state.isLoading = false
      state.isSearching = false
    },
    SET_KIOSK: (state, isKiosk: IIncidents['isKiosk']) =>
      (state.isKiosk = isKiosk),
    SET_SELECTED: (state, selected: IIncidents['selected']) =>
      (state.selected = selected),
    SET_NOTES: (state, notes: IIncidents['notes']) => (state.notes = notes),
    SET_ENVIRONMENTS: (state, environments: IIncidents['environments']) =>
      (state.environments = environments),
    SET_SERVICES: (state, services: IIncidents['services']) =>
      (state.services = services),
    SET_GROUPS: (state, groups: IIncidents['groups']) =>
      (state.groups = groups),
    SET_TAGS: (state, tags: IIncidents['tags']) => (state.tags = tags),
    SET_SETTING: (state, { s, v }) => (state[s] = v),
    SET_FILTER: (state, filter: IIncidents['filter']) =>
      Object.assign(state.filter, filter),
    SET_PAGINATION: (state, pagination: IIncidents['pagination']) =>
      Object.assign(state.pagination, pagination),
    SET_PANEL: (state, panel: IIncidents['showPanel']) =>
      (state.showPanel = panel)
  },
  actions: {
    async getIncidents({ rootGetters, commit, state }, filter = true) {
      commit('SET_LOADING')
      // get "lucene" query params (?q=)
      const params = new URLSearchParams(state.query)

      if (filter) {
        // append filter params to query params
        state.filter.environment &&
          params.append('environment', state.filter.environment)
        state.filter.status?.forEach((st) => params.append('status', st))
        state.filter.customer?.forEach((c) => params.append('customer', c))
        state.filter.service?.forEach((s) => params.append('service', s))
        state.filter.group?.forEach((g) => params.append('group', g))
        state.filter.owned && params.append('owner', rootGetters['auth/getId'])
      }

      // add server-side sorting
      let sortBy = state.pagination.sortBy
      if (sortBy.length === 0) sortBy = ['lastReceiveTime']

      if (sortBy.length === 1) {
        params.append(
          'sort-by',
          (state.pagination.sortDesc.length ? '-' : '') + sortBy
        )
      } else sortBy.forEach((sb) => params.append('sort-by', sb))

      // need notes from alert history if showing notes icons
      if (rootGetters.getPreference('showNotesIcon')) {
        params.append('show-history', 'true')
      }

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

      return IncidentsApi.getIncidents(params)
        .then(({ incidents, total, pageSize }) =>
          commit('SET_INCIDENTS', [incidents, total, pageSize])
        )
        .finally(() => commit('RESET_LOADING'))
    },

    async getIncident({ commit }, id: string) {
      commit('SET_LOADING')
      return IncidentsApi.getIncident(id)
        .then(({ incident }) => commit('SET_INCIDENT', incident))
        .catch(() => commit('SET_INCIDENT', null))
        .finally(() => commit('RESET_LOADING'))
    },
    async updateIncident({}, incident: Partial<IIncident> & { id: string }) {
      return IncidentsApi.updateIncident(incident.id, incident)
    },
    async createIncident({}, incident: Partial<IIncident>) {
      return IncidentsApi.createIncident(incident)
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

    async watchIncident({ rootState }, incidentId) {
      const username = rootState.auth.payload.preferred_username
      const tag = `watch:${username}`
      return IncidentsApi.tagIncident(incidentId, { tags: [tag] })
    },
    async unwatchIncident({ rootState }, incidentId) {
      const username = rootState.auth.payload.preferred_username
      const tag = `watch:${username}`
      return IncidentsApi.untagIncident(incidentId, { tags: [tag] })
    },
    async takeAction({}, [incidentId, action, text, timeout]) {
      return IncidentsApi.actionIncident(incidentId, {
        action,
        text,
        timeout
      })
    },
    async tagIncident({}, [incidentId, tags]) {
      return IncidentsApi.tagIncident(incidentId, tags)
    },
    async untagIncident({}, [incidentId, tags]) {
      return IncidentsApi.untagIncident(incidentId, tags)
    },

    async addNote({}, [incidentId, text]) {
      return IncidentsApi.addNote(incidentId, text)
    },
    async getNotes({ commit }, incidentId) {
      return IncidentsApi.getNotes(incidentId).then(({ notes }) => {
        commit('SET_NOTES', notes)
        return notes
      })
    },
    async updateNote({ dispatch }, [incidentId, noteId, note]) {
      return IncidentsApi.updateNote(incidentId, noteId, {
        note
      }).then(() => dispatch('getNotes'))
    },
    async deleteNote({ dispatch }, [incidentId, noteId]) {
      return IncidentsApi.deleteNote(incidentId, noteId).then(() =>
        dispatch('getNotes', [incidentId])
      )
    },

    async deleteIncident({}, incidentId) {
      return IncidentsApi.deleteIncident(incidentId)
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

      return IncidentsApi.getEnvironments(params).then(({ environments }) =>
        commit('SET_ENVIRONMENTS', environments)
      )
    },
    async getServices({ commit }) {
      return IncidentsApi.getServices({}).then(({ services }) =>
        commit('SET_SERVICES', services)
      )
    },
    async getGroups({ commit }) {
      return IncidentsApi.getGroups({}).then(({ groups }) =>
        commit('SET_GROUPS', groups)
      )
    },
    async getTags({ commit }) {
      return IncidentsApi.getTags({}).then(({ tags }) =>
        commit('SET_TAGS', tags)
      )
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

export default incidents
