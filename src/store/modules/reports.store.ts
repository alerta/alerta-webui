import { IReports, IStore } from '@/common/interfaces'
import AlertsApi from '@/services/api/alert.service'
import moment from 'moment'
import { Module } from 'vuex'

const state: IReports = {
  offenders: [],
  flapping: [],
  standing: [],

  filter: {
    environment: null,
    severity: null,
    status: ['open', 'ack'],
    customer: null,
    service: null,
    group: null,
    dateRange: [null, null]
  },

  pagination: {
    page: 1,
    itemsPerPage: 10
  }
}

const getParams = (state: IReports) => {
  // get "lucene" query params (?q=)
  const params = new URLSearchParams(state.query)

  // append filter params to query params
  state.filter.environment &&
    params.append('environment', state.filter.environment)

  state.filter.severity?.map((sv) => params.append('severity', sv))
  state.filter.status?.map((st) => params.append('status', st))
  state.filter.customer?.map((c) => params.append('customer', c))
  state.filter.service?.map((s) => params.append('service', s))
  state.filter.group?.map((g) => params.append('group', g))

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
      moment().utc().add(state.filter.dateRange[0], 'seconds').toISOString() // seconds offset
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
      moment().utc().add(state.filter.dateRange[1], 'seconds').toISOString() // seconds offset
    )
  }
  return params
}

const reports: Module<IReports, IStore> = {
  namespaced: true,
  state,
  actions: {
    async getTopOffenders({ commit, state }) {
      const params = getParams(state)
      return AlertsApi.getTop10Count(params).then(({ top10 }) =>
        commit('SET_TOP_OFFENDERS', top10)
      )
    },
    async getTopFlapping({ commit, state }) {
      const params = getParams(state)
      return AlertsApi.getTop10Flapping(params).then(({ top10 }) =>
        commit('SET_TOP_FLAPPING', top10)
      )
    },
    async getTopStanding({ commit, state }) {
      const params = getParams(state)
      return AlertsApi.getTop10Standing(params).then(({ top10 }) =>
        commit('SET_TOP_STANDING', top10)
      )
    },

    setFilter({ commit }, filter) {
      commit('SET_FILTER', filter)
    },
    resetFilter({ commit, rootState }) {
      commit('SET_FILTER', rootState.config?.filter)
    },
    setPageSize({ commit }, itemsPerPage) {
      commit('SET_PAGE_SIZE', itemsPerPage)
    }
  },
  mutations: {
    SET_TOP_OFFENDERS(state, top10) {
      state.offenders = top10
    },
    SET_TOP_FLAPPING(state, top10) {
      state.flapping = top10
    },
    SET_TOP_STANDING(state, top10) {
      state.standing = top10
    },
    SET_FILTER(state, filter) {
      state.filter = Object.assign({}, state.filter, filter)
    },
    SET_PAGE_SIZE(state, itemsPerPage) {
      state.pagination.itemsPerPage = itemsPerPage
    }
  }
}

export default reports
