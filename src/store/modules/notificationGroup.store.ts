import NotificationGroupApi from '@/services/api/notificationGroup.service'

const namespaced = true

const state = {
  isLoading: false,

  notificationGroups: [],

  pagination: {
    page: 1,
    rowsPerPage: 20,
    sortBy: 'name',
    descending: true,
    rowsPerPageItems: [10, 20, 50, 100, 200]
  }
}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_NOTIFICATION_GROUP(state, [notificationGroups, total, pageSize]) {
    state.isLoading = false
    state.notificationGroups = notificationGroups
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
  getNotificationGroups({commit, state}) {
    commit('SET_LOADING')

    let params = new URLSearchParams(state.query)

    // add server-side paging
    params.append('page', state.pagination.page)
    params.append('page-size', state.pagination.rowsPerPage)

    // add server-side sort
    params.append('sort-by', (state.pagination.descending ? '-' : '') + state.pagination.sortBy)

    return NotificationGroupApi.getNotificationGroups(params)
      .then(({notificationGroups, total, pageSize}) =>
        commit('SET_NOTIFICATION_GROUP', [notificationGroups, total, pageSize])
      )
      .catch(() => commit('RESET_LOADING'))
  },
  createNotificationGroup({dispatch, commit}, notificationrule) {
    return NotificationGroupApi.createNotificationGroup(notificationrule).then(response => {
      dispatch('getNotificationGroups')
    })
  },
  updateNotificationGroup({dispatch, commit}, [notificationGroupId, update]) {
    return NotificationGroupApi.updateNotificationGroup(notificationGroupId, update).then(response => {
      dispatch('getNotificationGroups')
    })
  },
  deleteNotificationGroup({dispatch, commit}, notificationGroupId) {
    return NotificationGroupApi.deleteNotificationGroup(notificationGroupId).then(response => {
      dispatch('getNotificationGroups')
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
