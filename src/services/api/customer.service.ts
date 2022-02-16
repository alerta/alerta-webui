import api from '.'

export default {
  async createCustomer(data: object) {
    return api.post('/customer', data)
  },
  async getCustomer(id: string) {
    return api.get(`/customer/${id}`)
  },
  async getCustomers(query: object) {
    const config = {
      params: query
    }
    return api.get('/customers', config)
  },
  async updateCustomer(id: string, data: object) {
    return api.put(`/customer/${id}`, data)
  },
  async deleteCustomer(id: string) {
    return api.delete(`/customer/${id}`)
  }
}
