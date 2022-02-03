import { IManagement } from '@/common/interfaces'
import api from './index'

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
