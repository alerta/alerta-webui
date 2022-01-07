import FiltersApi from '@/services/api/filter.service'

import utils from '@/common/utils'

const namespaced = true

const state = {
  isLoading: false,
  isSearching: false,

  filters: [],
  types: [],


  // query, filter and pagination
  query: {}, // URLSearchParams
  filter: {
    // local defaults
    type: null,
    attributes: null,
    environment: null,
    text: null,
    service: null,
    group: null
  },
  pagination: {
    page: 1,
    rowsPerPage: 20,
    sortBy: 'default',
    descending: false,
    rowsPerPageItems: [5, 10, 20, 50, 100, 200]
  }

}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_SEARCH_QUERY(state, query): any {
    state.isSearching = true
    state.query = query
  },
  SET_FILTERS(state, filters) {
    state.isLoading = false
    state.isSearching = false
    state.filters = filters
  },
  SET_FILTER(state, filter): any {
    state.filter = Object.assign({}, state.filter, filter)
  },
  RESET_LOADING(state) {
    state.isLoading = false
  },
  SET_TYPES(state, types): any {
    state.types = types 
  },
}

const actions = {
  getFilters({commit}) {
    commit('SET_LOADING')
    // get "lucene" query params (?q=)
    let params = new URLSearchParams(state.query)

    return FiltersApi.getFilters(params)
      .then(({filters}) => commit('SET_FILTERS', filters))
      .catch(() => commit('RESET_LOADING'))
  },
  createFilter({dispatch, commit}, filter) {
    return FiltersApi.createFilter(filter).then(response => {
      dispatch('getFilters')
    })
  },
  updateFilter({dispatch, commit}, [filterId, update]) {
    return FiltersApi.updateFilter(filterId, update).then(response => {
      dispatch('getFilters')
    })
  },
  deleteFilter({dispatch, commit}, filterId) {
    return FiltersApi.deleteFilter(filterId).then(response => {
      dispatch('getFilters')
    })
  },
  getFilterTypes({commit}) {
    return FiltersApi.getFilterTypes({}).then(({types}) => commit('SET_TYPES', types))
  },
  setFilter({commit}, filter) {
    commit('SET_FILTERS', filter)
  },
  resetFilter({commit, rootState}) {
    commit('SET_FILTERS', rootState.config.filter)
  },
  updateQuery({commit}, query) {
    commit('SET_SEARCH_QUERY', query)
  },
}

const getters = {
  types: state => {
    return state.types.map(t => t.type).sort()
  },
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
