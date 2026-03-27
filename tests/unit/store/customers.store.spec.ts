import customersStore from '@/store/modules/customers.store'

jest.mock('@/services/api/customer.service', () => ({
  __esModule: true,
  default: {
    getCustomers: jest.fn(),
    createCustomer: jest.fn(),
    updateCustomer: jest.fn(),
    deleteCustomer: jest.fn()
  }
}))

import CustomersApi from '@/services/api/customer.service'

const { mutations, actions, getters } = customersStore

function freshState() {
  return { isLoading: false, customers: [] }
}

describe('customers store', () => {
  describe('mutations', () => {
    it('SET_CUSTOMERS stores customers and clears loading', () => {
      const state = freshState()
      state.isLoading = true
      mutations.SET_CUSTOMERS(state, [{ id: 'c1', customer: 'Acme' }])
      expect(state.isLoading).toBe(false)
      expect(state.customers).toHaveLength(1)
    })
  })

  describe('getters', () => {
    it('customers extracts customer names', () => {
      const state = {
        customers: [
          { id: 'c1', customer: 'Acme' },
          { id: 'c2', customer: 'Globex' }
        ]
      }
      expect(getters.customers(state)).toEqual(['Acme', 'Globex'])
    })
  })

  describe('actions', () => {
    let commit: jest.Mock
    let dispatch: jest.Mock

    beforeEach(() => {
      commit = jest.fn()
      dispatch = jest.fn()
    })

    it('getCustomers fetches and commits customers', async () => {
      (CustomersApi.getCustomers as jest.Mock).mockResolvedValue({ customers: [{ id: 'c1' }] })

      await actions.getCustomers({ commit })
      expect(commit).toHaveBeenCalledWith('SET_LOADING')
      expect(commit).toHaveBeenCalledWith('SET_CUSTOMERS', [{ id: 'c1' }])
    })

    it('getCustomers resets loading on failure', async () => {
      (CustomersApi.getCustomers as jest.Mock).mockRejectedValue(new Error('fail'))

      await actions.getCustomers({ commit })
      expect(commit).toHaveBeenCalledWith('RESET_LOADING')
    })

    it('createCustomer creates and refreshes list', async () => {
      (CustomersApi.createCustomer as jest.Mock).mockResolvedValue({})

      await actions.createCustomer({ dispatch, commit }, { customer: 'Acme', match: 'acme.com' })
      expect(CustomersApi.createCustomer).toHaveBeenCalledWith({ customer: 'Acme', match: 'acme.com' })
      expect(dispatch).toHaveBeenCalledWith('getCustomers')
    })

    it('updateCustomer updates and refreshes list', async () => {
      (CustomersApi.updateCustomer as jest.Mock).mockResolvedValue({})

      await actions.updateCustomer({ dispatch, commit }, ['c1', { customer: 'Updated' }])
      expect(CustomersApi.updateCustomer).toHaveBeenCalledWith('c1', { customer: 'Updated' })
      expect(dispatch).toHaveBeenCalledWith('getCustomers')
    })

    it('deleteCustomer deletes and refreshes list', async () => {
      (CustomersApi.deleteCustomer as jest.Mock).mockResolvedValue({})

      await actions.deleteCustomer({ dispatch, commit }, 'c1')
      expect(CustomersApi.deleteCustomer).toHaveBeenCalledWith('c1')
      expect(dispatch).toHaveBeenCalledWith('getCustomers')
    })
  })
})
