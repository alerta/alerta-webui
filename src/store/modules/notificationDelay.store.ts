import NotificationDelayApi from '@/services/api/notificationDelay.service'

const namespaced = true

const state = {
  isLoading: false,

  notification_delays: [],

  pagination: {
    page: 1,
    rowsPerPage: 15,
    sortBy: 'delay_time',
    descending: true,
    rowsPerPageItems: [10, 15, 30, 50, 100, 200]
  }
}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_NOTIFICATION_DELAY(state, [notificationDelays, total, pageSize]) {
    state.isLoading = false
    state.notification_delays = notificationDelays
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
  getNotificationDelays({commit, state}) {
    commit('SET_LOADING')
    let params = new URLSearchParams()

    // add server-side paging
    params.append('page', state.pagination.page)
    params.append('page-size', state.pagination.rowsPerPage)

    // add server-side sort
    params.append('sort-by', (state.pagination.descending ? '-' : '') + state.pagination.sortBy)

    return NotificationDelayApi.getNotificationDelays(params)
      .then(({notificationDelays, total, pageSize}) =>
        commit('SET_NOTIFICATION_DELAY', [notificationDelays, total, pageSize])
      )
      .catch(() => commit('RESET_LOADING'))
  },
  deleteNotificationDelay({dispatch, commit}, notificationDelayId) {
    return NotificationDelayApi.deleteNotificationDelay(notificationDelayId).then(response => {
      dispatch('getNotificationDelays')
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
