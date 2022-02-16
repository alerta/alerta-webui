import { ICustomers, IStore } from '@/store/interfaces'
import CustomersApi from '@/services/api/customer.service'
import { Module } from 'vuex'

const state: ICustomers = {
  isLoading: false,
  customers: []
}

const customers: Module<ICustomers, IStore> = {
  namespaced: true,
  state,
  mutations: {
    SET_LOADING(state) {
      state.isLoading = true
    },
    SET_CUSTOMERS(state, customers) {
      state.isLoading = false
      state.customers = customers
    },
    RESET_LOADING(state) {
      state.isLoading = false
    }
  },
  getters: {
    customers: (state) => {
      return state.customers.map((c) => c.customer)
    }
  },
  actions: {
    async getCustomers({ commit }) {
      commit('SET_LOADING')
      return CustomersApi.getCustomers({})
        .then(({ customers }) => commit('SET_CUSTOMERS', customers))
        .catch(() => commit('RESET_LOADING'))
    },
    async createCustomer({ dispatch }, customer) {
      return CustomersApi.createCustomer(customer).then(() =>
        dispatch('getCustomers')
      )
    },
    async updateCustomer({ dispatch }, [customerId, update]) {
      return CustomersApi.updateCustomer(customerId, update).then(() =>
        dispatch('getCustomers')
      )
    },
    async deleteCustomer({ dispatch }, customerId) {
      return CustomersApi.deleteCustomer(customerId).then(() =>
        dispatch('getCustomers')
      )
    }
  }
}

export default customers
