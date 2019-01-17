import api from './index'

export default {
  createCustomer(data: object) {
    return api.post('/customer', data)
  },
  getCustomer(id: string) {
    return api.get(`/customer/${id}`)
  },
  getCustomers(query: object) {
    let config = {
      params: query
    }
    return api.get('/customers', config)
  },
  updateCustomer(id: string, data: object) {
    return api.put(`/customer/${id}`, data)
  },
  deleteCustomer(id: string) {
    return api.delete(`/customer/${id}`)
  }
}
