import AlertsApi from '@/services/api/alert.service'

import moment from 'moment'

const namespaced = true

const state = {
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
    rowsPerPage: 10
  }
}

const mutations = {
  SET_TOP_OFFENDERS(state, top10): any {
    state.offenders = top10
  },
  SET_TOP_FLAPPING(state, top10): any {
    state.flapping = top10
  },
  SET_TOP_STANDING(state, top10): any {
    state.standing = top10
  },
  SET_FILTER(state, filter): any {
    state.filter = Object.assign({}, state.filter, filter)
  },
  SET_PAGE_SIZE(state, rowsPerPage) {
    state.pagination.rowsPerPage = rowsPerPage
  }
}

function getParams(state) {
  // get "lucene" query params (?q=)
  let params = new URLSearchParams(state.query)

  // append filter params to query params
  state.filter.environment && params.append('environment', state.filter.environment)
  state.filter.severity && state.filter.severity.map(sv => params.append('severity', sv))
  state.filter.status && state.filter.status.map(st => params.append('status', st))
  state.filter.customer && state.filter.customer.map(c => params.append('customer', c))
  state.filter.service && state.filter.service.map(s => params.append('service', s))
  state.filter.group && state.filter.group.map(g => params.append('group', g))

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
  return params
}

const actions = {
  getTopOffenders({commit, state}) {
    let params = getParams(state)
    return AlertsApi.getTop10Count(params).then(({top10}) => commit('SET_TOP_OFFENDERS', top10))
  },
  getTopFlapping({commit, state}) {
    let params = getParams(state)
    return AlertsApi.getTop10Flapping(params).then(({top10}) => commit('SET_TOP_FLAPPING', top10))
  },
  getTopStanding({commit, state}) {
    let params = getParams(state)
    return AlertsApi.getTop10Standing(params).then(({top10}) => commit('SET_TOP_STANDING', top10))
  },

  setFilter({commit}, filter) {
    commit('SET_FILTER', filter)
  },
  resetFilter({commit, rootState}) {
    commit('SET_FILTER', rootState.config.filter)
  },
  setPageSize({commit}, rowsPerPage) {
    commit('SET_PAGE_SIZE', rowsPerPage)
  }
}

const getters = {}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
