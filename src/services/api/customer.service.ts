import api from '.'

export default {
  async createCustomer(data: object) {
    return api.post('/customer', data).then((res) => res.data)
  },
  async getCustomer(id: string) {
    return api.get(`/customer/${id}`).then((res) => res.data)
  },
  async getCustomers(query: object) {
    const config = {
      params: query
    }
    return api.get('/customers', config).then((res) => res.data)
  },
  async updateCustomer(id: string, data: object) {
    return api.put(`/customer/${id}`, data).then((res) => res.data)
  },
  async deleteCustomer(id: string) {
    return api.delete(`/customer/${id}`).then((res) => res.data)
  }
}
