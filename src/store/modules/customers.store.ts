import CustomersApi from '@/services/api/customer.service'

const namespaced = true

const state = {
  isLoading: false,

  customers: [],

  pagination: {
    page: 1,
    rowsPerPage: 20,
    sortBy: 'match',
    descending: false,
    rowsPerPageItems: [10, 20, 50, 100, 200]
  }
}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_CUSTOMERS(state, [customers, total, pageSize]) {
    state.isLoading = false
    state.customers = customers
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
  getCustomers({ commit, state }) {
    commit('SET_LOADING')

    let params = new URLSearchParams(state.query)

    // add server-side paging
    params.append('page', state.pagination.page)
    params.append('page-size', state.pagination.rowsPerPage)

    // add server-side sort
    params.append('sort-by', (state.pagination.descending ? '-' : '') + state.pagination.sortBy)

    return CustomersApi.getCustomers(params)
      .then(({ customers, total, pageSize }) => commit('SET_CUSTOMERS', [customers, total, pageSize]))
      .catch(() => commit('RESET_LOADING'))
  },
  createCustomer({ dispatch, commit }, customer) {
    return CustomersApi.createCustomer(customer)
      .then(response => {
        dispatch('getCustomers')
      })
  },
  updateCustomer({ dispatch, commit }, [customerId, update]) {
    return CustomersApi.updateCustomer(customerId, update)
      .then(response => {
        dispatch('getCustomers')
      })
  },
  deleteCustomer({ dispatch, commit }, customerId) {
    return CustomersApi.deleteCustomer(customerId)
      .then(response => {
        dispatch('getCustomers')
      })
  },
  setPagination({ commit }, pagination) {
    commit('SET_PAGINATION', pagination)
  }
}

const getters = {
  customers: state => {
    return state.customers.map(c => c.customer)
  },
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
