import NotificationRuleApi from '@/services/api/notificationRule.service'

const namespaced = true

const state = {
  isLoading: false,

  notification_rules: [],

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
  SET_NOTIFICATION_RULE(state, [notificationRules, total, pageSize]) {
    state.isLoading = false
    state.notification_rules = notificationRules
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
  getNotificationRules({ commit, state }) {
    commit('SET_LOADING')

    let params = new URLSearchParams(state.query)

    // add server-side paging
    params.append('page', state.pagination.page)
    params.append('page-size', state.pagination.rowsPerPage)

    // add server-side sort
    params.append('sort-by', (state.pagination.descending ? '-' : '') + state.pagination.sortBy)

    return NotificationRuleApi.getNotificationRules(params)
      .then(({ notificationRules, total, pageSize }) => commit('SET_NOTIFICATION_RULE', [notificationRules, total, pageSize]))
      .catch(() => commit('RESET_LOADING'))
  },
  createNotificationRule({ dispatch, commit }, notificationrule) {
    return NotificationRuleApi.createNotificationRule(notificationrule)
      .then(response => {
        dispatch('getNotificationRules')
      })
  },
  updateNotificationRule({ dispatch, commit }, [notificationRuleId, update]) {
    return NotificationRuleApi.updateNotificationRule(notificationRuleId, update)
      .then(response => {
        dispatch('getNotificationRules')
      })
  },
  deleteNotificationRule({ dispatch, commit }, notificationRuleId) {
    return NotificationRuleApi.deleteNotificationRule(notificationRuleId)
      .then(response => {
        dispatch('getNotificationRules')
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
