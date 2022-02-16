import { IManagement } from '@/store/interfaces'
import api from '.'

export default {
  async manifest() {
    return api.get<IManagement['manifest']>('/management/manifest')
  },
  async healthcheck() {
    return api.get<IManagement['healthcheck']>('/management/healthcheck')
  },
  async status() {
    return api.get<IManagement['status']>('/management/status')
  }
}
