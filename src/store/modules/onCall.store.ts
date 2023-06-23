import OnCallApi from '@/services/api/onCall.service'

const namespaced = true

const state = {
  isLoading: false,

  on_calls: [],

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
  SET_ON_CALL(state, [onCalls, total, pageSize]) {
    state.isLoading = false
    state.on_calls = onCalls
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
  getOnCalls({commit, state}) {
    commit('SET_LOADING')

    let params = new URLSearchParams(state.query)

    // add server-side paging
    params.append('page', state.pagination.page)
    params.append('page-size', state.pagination.rowsPerPage)

    // add server-side sort
    params.append('sort-by', (state.pagination.descending ? '-' : '') + state.pagination.sortBy)

    return OnCallApi.getOnCalls(params)
      .then(({onCalls, total, pageSize}) => commit('SET_ON_CALL', [onCalls, total, pageSize]))
      .catch(() => commit('RESET_LOADING'))
  },
  createOnCall({dispatch, commit}, notificationrule) {
    return OnCallApi.createOnCall(notificationrule).then(response => {
      dispatch('getOnCalls')
    })
  },
  updateOnCall({dispatch, commit}, [onCallId, update]) {
    return OnCallApi.updateOnCall(onCallId, update).then(response => {
      dispatch('getOnCalls')
    })
  },
  deleteOnCall({dispatch, commit}, onCallId) {
    return OnCallApi.deleteOnCall(onCallId).then(response => {
      dispatch('getOnCalls')
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
