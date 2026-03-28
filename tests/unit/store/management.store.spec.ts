import managementStore from '@/store/modules/management.store'

jest.mock('@/services/api/management.service', () => ({
  __esModule: true,
  default: {
    manifest: jest.fn(),
    healthcheck: jest.fn(),
    status: jest.fn()
  }
}))

import ManagementApi from '@/services/api/management.service'

const {mutations, actions} = managementStore

function freshState() {
  return {
    manifest: null,
    healthcheck: null,
    application: null,
    metrics: [],
    time: null,
    uptime: null,
    version: null
  }
}

describe('management store', () => {
  describe('mutations', () => {
    it('SET_MANIFEST stores manifest', () => {
      const state = freshState()
      const manifest = {name: 'alerta', version: '8.0.0'}
      mutations.SET_MANIFEST(state, manifest)
      expect(state.manifest).toEqual(manifest)
    })

    it('SET_HEALTHCHECK stores healthcheck', () => {
      const state = freshState()
      mutations.SET_HEALTHCHECK(state, 'ok')
      expect(state.healthcheck).toBe('ok')
    })

    it('SET_STATUS stores all status fields', () => {
      const state = freshState()
      const status = {
        application: 'alerta',
        metrics: [{name: 'alerts', count: 100}],
        time: 1234567890,
        uptime: 3600,
        version: '8.0.0'
      }
      mutations.SET_STATUS(state, status)
      expect(state.application).toBe('alerta')
      expect(state.metrics).toEqual([{name: 'alerts', count: 100}])
      expect(state.time).toBe(1234567890)
      expect(state.uptime).toBe(3600)
      expect(state.version).toBe('8.0.0')
    })
  })

  describe('actions', () => {
    let commit: jest.Mock
    let dispatch: jest.Mock

    beforeEach(() => {
      commit = jest.fn()
      dispatch = jest.fn()
    })

    it('getManifest fetches and commits manifest', async () => {
      const manifest = {name: 'alerta'}
      ;(ManagementApi.manifest as jest.Mock).mockResolvedValue(manifest)

      await actions.getManifest({commit, dispatch})
      expect(commit).toHaveBeenCalledWith('SET_MANIFEST', manifest)
    })

    it('getHealthcheck fetches and commits healthcheck', async () => {
      ;(ManagementApi.healthcheck as jest.Mock).mockResolvedValue('ok')

      await actions.getHealthcheck({commit, dispatch})
      expect(commit).toHaveBeenCalledWith('SET_HEALTHCHECK', 'ok')
    })

    it('getStatus fetches and commits status', async () => {
      const status = {application: 'alerta', metrics: [], time: 0, uptime: 0, version: '8'}
      ;(ManagementApi.status as jest.Mock).mockResolvedValue(status)

      await actions.getStatus({commit, dispatch})
      expect(commit).toHaveBeenCalledWith('SET_STATUS', status)
    })
  })
})
