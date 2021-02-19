import TwilioRuleApi from '@/services/api/twilioRule.service'

const namespaced = true

const state = {
  isLoading: false,

  twilio_rules: [],

  pagination: {
    page: 1,
    rowsPerPage: 20,
    sortBy: 'startTime',
    descending: true,
    rowsPerPageItems: [10, 20, 50, 100, 200]
  }
}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_TWILIO_RULE(state, [twilioRules, total, pageSize]) {
    state.isLoading = false
    state.twilio_rules = twilioRules
    state.pagination.totalItems = total
    state.pagination.rowsPerPage = pageSize
  },
  RESET_LOADING(state) {
    state.isLoading = false
  },
  SET_PAGINATION(state, pagination) {
    state.pagination = Object.assign({}, state.pagination, pagination)
  }
}

const actions = {
  getTwilioRules({ commit, state }) {
    commit('SET_LOADING')

    let params = new URLSearchParams(state.query)

    // add server-side paging
    params.append('page', state.pagination.page)
    params.append('page-size', state.pagination.rowsPerPage)

    // add server-side sort
    params.append('sort-by', (state.pagination.descending ? '-' : '') + state.pagination.sortBy)

    return TwilioRuleApi.getTwilioRules(params)
      .then(({ twilioRules, total, pageSize }) => commit('SET_TWILIO_RULE', [twilioRules, total, pageSize]))
      .catch(() => commit('RESET_LOADING'))
  },
  createTwilioRule({ dispatch, commit }, twiliorule) {
    return TwilioRuleApi.createTwilioRule(twiliorule)
      .then(response => {
        dispatch('getTwilioRules')
      })
  },
  updateTwilioRule({ dispatch, commit }, [twilioRuleId, update]) {
    return TwilioRuleApi.updateTwilioRule(twilioRuleId, update)
      .then(response => {
        dispatch('getTwilioRules')
      })
  },
  deleteTwilioRule({ dispatch, commit }, twilioRuleId) {
    return TwilioRuleApi.deleteTwilioRule(twilioRuleId)
      .then(response => {
        dispatch('getTwilioRules')
      })
  },
  setPagination({ commit }, pagination) {
    commit('SET_PAGINATION', pagination)
  }
}

const getters = {
  pagination: state => {
    return state.pagination
  }
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
