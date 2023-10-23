import EscalationRuleApi from '@/services/api/escalationRule.service'

const namespaced = true

const state = {
  isLoading: false,

  escalation_rules: [],

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
  SET_ESCALATION_RULE(state, [escalationRules, total, pageSize]) {
    state.isLoading = false
    state.escalation_rules = escalationRules
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
  getEscalationRules({commit, state}) {
    commit('SET_LOADING')

    let params = new URLSearchParams(state.query)

    // add server-side paging
    params.append('page', state.pagination.page)
    params.append('page-size', state.pagination.rowsPerPage)

    // add server-side sort
    params.append('sort-by', (state.pagination.descending ? '-' : '') + state.pagination.sortBy)

    return EscalationRuleApi.getEscalationRules(params)
      .then(({escalationRules, total, pageSize}) =>
        commit('SET_ESCALATION_RULE', [escalationRules, total, pageSize])
      )
      .catch(() => commit('RESET_LOADING'))
  },
  createEscalationRule({dispatch, commit}, escalationrule) {
    return EscalationRuleApi.createEscalationRule(escalationrule).then(response => {
      dispatch('getEscalationRules')
    })
  },
  updateEscalationRule({dispatch, commit}, [escalationRuleId, update]) {
    return EscalationRuleApi.updateEscalationRule(escalationRuleId, update).then(response => {
      dispatch('getEscalationRules')
    })
  },
  deleteEscalationRule({dispatch, commit}, escalationRuleId) {
    return EscalationRuleApi.deleteEscalationRule(escalationRuleId).then(response => {
      dispatch('getEscalationRules')
    })
  },
  setPagination({commit}, pagination) {
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
