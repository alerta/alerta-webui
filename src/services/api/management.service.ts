import api from './index'

export default {
  manifest() {
    return api.get('/management/manifest')
  },
  healthcheck() {
    return api.get('/management/healthcheck')
  },
  status() {
    return api.get('/management/status')
  }
}
