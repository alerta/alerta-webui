import CustomersApi from '@/services/api/customer.service'

const namespaced = true

const state = {
  isLoading: false,
  error: null,

  customers: []
}

const mutations = {
  SET_LOADING(state) {
    state.isLoading = true
  },
  SET_CUSTOMERS(state, customers) {
    state.isLoading = false
    state.customers = customers
  },
  SET_ERROR(state, error) {
    state.isLoading = false
    state.error = error
  }
}

const actions = {
  getCustomers({ commit }) {
    commit('SET_LOADING')
    return CustomersApi.getCustomers({})
      .then(({ customers }) => commit('SET_CUSTOMERS', customers))
      .catch(error => commit('SET_ERROR', error.response.data.message))
  },
  createCustomer({ dispatch, commit }, customer) {
    return CustomersApi.createCustomer(customer)
      .then(response => {
        dispatch('getCustomers')
      })
      .catch(error => commit('SET_ERROR', error.response.data.message))
  },
  updateCustomer({ dispatch, commit }, [customerId, update]) {
    return CustomersApi.updateCustomer(customerId, update)
      .then(response => {
        dispatch('getCustomers')
      })
      .catch(error => dispatch('notifications/error', error, { root: true }))
  },
  deleteCustomer({ dispatch, commit }, customerId) {
    return CustomersApi.deleteCustomer(customerId)
      .then(response => {
        dispatch('getCustomers')
      })
      .catch(error => commit('SET_ERROR', error.response.data.message))
  }
}

const getters = {
  customers: state => {
    return state.customers.map(c => c.customer)
  }
}

export default {
  namespaced,
  state,
  mutations,
  actions,
  getters
}
