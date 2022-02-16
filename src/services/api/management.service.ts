import { IManagement } from '@/store/interfaces'
import api from '.'

export default {
  async manifest() {
    return api
      .get<IManagement['manifest']>('/management/manifest')
      .then((res) => res.data)
  },
  async healthcheck() {
    return api
      .get<IManagement['healthcheck']>('/management/healthcheck')
      .then((res) => res.data)
  },
  async status() {
    return api
      .get<IManagement['status']>('/management/status')
      .then((res) => res.data)
  }
}
