import api from './index'

export default {
  async manifest() {
    return api.get('/management/manifest')
  },
  async healthcheck() {
    return api.get('/management/healthcheck')
  },
  async status() {
    return api.get('/management/status')
  }
}
