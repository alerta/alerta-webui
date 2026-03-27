import alertsStore from '@/store/modules/alerts.store'

// Mock the API service
jest.mock('@/services/api/alert.service', () => ({
  __esModule: true,
  default: {
    getAlerts: jest.fn(),
    getAlert: jest.fn(),
    tagAlert: jest.fn(),
    untagAlert: jest.fn(),
    actionAlert: jest.fn(),
    addNote: jest.fn(),
    getNotes: jest.fn(),
    updateNote: jest.fn(),
    deleteNote: jest.fn(),
    deleteAlert: jest.fn(),
    getEnvironments: jest.fn(),
    getServices: jest.fn(),
    getGroups: jest.fn(),
    getTags: jest.fn()
  }
}))

jest.mock('@/common/utils', () => ({
  __esModule: true,
  default: {
    toHash: jest.fn().mockReturnValue('env:Production;status:open,ack')
  }
}))

import AlertsApi from '@/services/api/alert.service'

const { state: defaultState, mutations, actions, getters } = alertsStore

function freshState() {
  return JSON.parse(JSON.stringify(defaultState))
}

describe('alerts store', () => {
  describe('mutations', () => {
    it('SET_LOADING sets isLoading to true', () => {
      const state = freshState()
      mutations.SET_LOADING(state)
      expect(state.isLoading).toBe(true)
    })

    it('SET_SEARCH_QUERY sets searching state and query', () => {
      const state = freshState()
      const query = { q: 'test' }
      mutations.SET_SEARCH_QUERY(state, query)
      expect(state.isSearching).toBe(true)
      expect(state.query).toEqual(query)
    })

    it('SET_ALERTS stores alerts and resets loading', () => {
      const state = freshState()
      state.isLoading = true
      state.isSearching = true
      const alerts = [{ id: '1', resource: 'web01' }, { id: '2', resource: 'web02' }]
      mutations.SET_ALERTS(state, [alerts, 2, 20])
      expect(state.isLoading).toBe(false)
      expect(state.isSearching).toBe(false)
      expect(state.alerts).toEqual(alerts)
      expect(state.pagination.totalItems).toBe(2)
      expect(state.pagination.rowsPerPage).toBe(20)
    })

    it('RESET_LOADING clears loading flags', () => {
      const state = freshState()
      state.isLoading = true
      state.isSearching = true
      mutations.RESET_LOADING(state)
      expect(state.isLoading).toBe(false)
      expect(state.isSearching).toBe(false)
    })

    it('SET_KIOSK sets kiosk mode', () => {
      const state = freshState()
      mutations.SET_KIOSK(state, true)
      expect(state.isKiosk).toBe(true)
    })

    it('SET_SELECTED stores selected items', () => {
      const state = freshState()
      const selected = [{ id: '1' }, { id: '2' }]
      mutations.SET_SELECTED(state, selected)
      expect(state.selected).toEqual(selected)
    })

    it('SET_ALERT stores a single alert', () => {
      const state = freshState()
      const alert = { id: '1', resource: 'web01', event: 'NodeDown' }
      mutations.SET_ALERT(state, alert)
      expect(state.alert).toEqual(alert)
    })

    it('SET_NOTES stores notes', () => {
      const state = freshState()
      const notes = [{ id: 'n1', text: 'test note' }]
      mutations.SET_NOTES(state, notes)
      expect(state.notes).toEqual(notes)
    })

    it('SET_ENVIRONMENTS stores environments', () => {
      const state = freshState()
      const envs = [{ environment: 'Production', count: 5 }]
      mutations.SET_ENVIRONMENTS(state, envs)
      expect(state.environments).toEqual(envs)
    })

    it('SET_SERVICES stores services', () => {
      const state = freshState()
      const services = [{ service: 'web' }]
      mutations.SET_SERVICES(state, services)
      expect(state.services).toEqual(services)
    })

    it('SET_GROUPS stores groups', () => {
      const state = freshState()
      const groups = [{ group: 'Network' }]
      mutations.SET_GROUPS(state, groups)
      expect(state.groups).toEqual(groups)
    })

    it('SET_TAGS stores tags', () => {
      const state = freshState()
      const tags = [{ tag: 'critical' }]
      mutations.SET_TAGS(state, tags)
      expect(state.tags).toEqual(tags)
    })

    it('SET_SETTING sets an arbitrary state key', () => {
      const state = freshState()
      mutations.SET_SETTING(state, { s: 'isWatch', v: true })
      expect(state.isWatch).toBe(true)
    })

    it('SET_FILTER merges filter values', () => {
      const state = freshState()
      mutations.SET_FILTER(state, { environment: 'Production' })
      expect(state.filter.environment).toBe('Production')
      expect(state.filter.status).toEqual(['open', 'ack']) // unchanged

      mutations.SET_FILTER(state, { status: ['open'] })
      expect(state.filter.environment).toBe('Production') // retained
      expect(state.filter.status).toEqual(['open'])
    })

    it('SET_PAGINATION merges pagination values', () => {
      const state = freshState()
      mutations.SET_PAGINATION(state, { page: 3 })
      expect(state.pagination.page).toBe(3)
      expect(state.pagination.rowsPerPage).toBe(20) // unchanged
    })

    it('SET_PANEL sets panel visibility', () => {
      const state = freshState()
      mutations.SET_PANEL(state, true)
      expect(state.showPanel).toBe(true)
    })
  })

  describe('getters', () => {
    it('alerts returns all alerts when isWatch is false', () => {
      const state = freshState()
      state.alerts = [
        { id: '1', tags: ['watch:user1'] },
        { id: '2', tags: [] }
      ]
      state.isWatch = false
      const rootState = { auth: { payload: { preferred_username: 'user1' } } }

      const result = getters.alerts(state, {}, rootState)
      expect(result).toHaveLength(2)
    })

    it('alerts filters by watch tag when isWatch is true', () => {
      const state = freshState()
      state.alerts = [
        { id: '1', tags: ['watch:user1'] },
        { id: '2', tags: [] },
        { id: '3', tags: ['watch:user2'] }
      ]
      state.isWatch = true
      const rootState = { auth: { payload: { preferred_username: 'user1' } } }

      const result = getters.alerts(state, {}, rootState)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('environments returns sorted environment names', () => {
      const state = freshState()
      state.environments = [
        { environment: 'Production', count: 5 },
        { environment: 'Development', count: 3 }
      ]
      const rootState = { config: { environments: [] } }

      const envGetter = getters.environments(state, {}, rootState)
      expect(envGetter(false)).toEqual(['Development', 'Production'])
    })

    it('environments merges config environments when showAllowedEnvs is true', () => {
      const state = freshState()
      state.environments = [{ environment: 'Production', count: 5 }]
      const rootState = { config: { environments: ['Staging'] } }

      const envGetter = getters.environments(state, {}, rootState)
      expect(envGetter(true)).toEqual(['Production', 'Staging'])
    })

    it('counts reduces environments into a count map', () => {
      const state = freshState()
      state.environments = [
        { environment: 'Production', count: 5 },
        { environment: 'Development', count: 3 }
      ]

      const result = getters.counts(state)
      expect(result).toEqual({ ALL: 8, Production: 5, Development: 3 })
    })

    it('counts returns ALL:0 for empty environments', () => {
      const state = freshState()
      state.environments = []
      expect(getters.counts(state)).toEqual({ ALL: 0 })
    })

    it('services returns sorted service names', () => {
      const state = freshState()
      state.services = [{ service: 'Web' }, { service: 'API' }]
      expect(getters.services(state)).toEqual(['API', 'Web'])
    })

    it('groups returns sorted group names', () => {
      const state = freshState()
      state.groups = [{ group: 'Network' }, { group: 'App' }]
      expect(getters.groups(state)).toEqual(['App', 'Network'])
    })

    it('tags returns sorted tag names', () => {
      const state = freshState()
      state.tags = [{ tag: 'warning' }, { tag: 'critical' }]
      expect(getters.tags(state)).toEqual(['critical', 'warning'])
    })

    it('getHash produces a hash string from filter and pagination', () => {
      const state = freshState()
      state.pagination.sortBy = 'severity'
      state.pagination.descending = true
      state.showPanel = false

      const result = getters.getHash(state)
      expect(result).toContain('sb:severity')
      expect(result).toContain('sd:1')
      expect(result).toContain('asi:0')
    })
  })

  describe('actions', () => {
    let commit: jest.Mock
    let dispatch: jest.Mock
    let rootGetters: any
    let rootState: any

    beforeEach(() => {
      commit = jest.fn()
      dispatch = jest.fn()
      rootGetters = {
        getConfig: jest.fn().mockReturnValue(['severity', 'lastReceiveTime']),
        getPreference: jest.fn().mockReturnValue(false)
      }
      rootState = {
        auth: { payload: { preferred_username: 'testuser' } },
        config: { filter: { text: null, environment: null, status: null, service: null, group: null, dateRange: [null, null] } }
      }
    })

    it('getAlerts fetches alerts and commits result', async () => {
      const state = freshState();
      (AlertsApi.getAlerts as jest.Mock).mockResolvedValue({
        alerts: [{ id: '1' }],
        total: 1,
        pageSize: 20
      })

      await actions.getAlerts({ rootGetters, commit, state })
      expect(commit).toHaveBeenCalledWith('SET_LOADING')
      expect(commit).toHaveBeenCalledWith('SET_ALERTS', [[{ id: '1' }], 1, 20])
    })

    it('getAlerts resets loading on API failure', async () => {
      const state = freshState();
      (AlertsApi.getAlerts as jest.Mock).mockRejectedValue(new Error('fail'))

      await actions.getAlerts({ rootGetters, commit, state })
      expect(commit).toHaveBeenCalledWith('SET_LOADING')
      expect(commit).toHaveBeenCalledWith('RESET_LOADING')
    })

    it('updateQuery commits search query', () => {
      const query = { q: 'test' }
      actions.updateQuery({ commit }, query)
      expect(commit).toHaveBeenCalledWith('SET_SEARCH_QUERY', query)
    })

    it('updateKiosk commits kiosk state', () => {
      actions.updateKiosk({ commit }, true)
      expect(commit).toHaveBeenCalledWith('SET_KIOSK', true)
    })

    it('updateSelected commits selection', () => {
      actions.updateSelected({ commit }, [{ id: '1' }])
      expect(commit).toHaveBeenCalledWith('SET_SELECTED', [{ id: '1' }])
    })

    it('getAlert fetches and commits a single alert', async () => {
      (AlertsApi.getAlert as jest.Mock).mockResolvedValue({ alert: { id: '1', event: 'NodeDown' } })

      await actions.getAlert({ commit }, '1')
      expect(commit).toHaveBeenCalledWith('SET_ALERT', { id: '1', event: 'NodeDown' })
    })

    it('watchAlert tags alert with watch:username', async () => {
      (AlertsApi.tagAlert as jest.Mock).mockResolvedValue({})

      await actions.watchAlert({ commit, dispatch, rootState }, 'alert-1')
      expect(AlertsApi.tagAlert).toHaveBeenCalledWith('alert-1', { tags: ['watch:testuser'] })
    })

    it('unwatchAlert untags alert with watch:username', async () => {
      (AlertsApi.untagAlert as jest.Mock).mockResolvedValue({})

      await actions.unwatchAlert({ commit, dispatch, rootState }, 'alert-1')
      expect(AlertsApi.untagAlert).toHaveBeenCalledWith('alert-1', { tags: ['watch:testuser'] })
    })

    it('takeAction calls actionAlert with params', async () => {
      (AlertsApi.actionAlert as jest.Mock).mockResolvedValue({})

      await actions.takeAction({ commit, dispatch }, ['alert-1', 'ack', 'acknowledged', 7200])
      expect(AlertsApi.actionAlert).toHaveBeenCalledWith('alert-1', {
        action: 'ack',
        text: 'acknowledged',
        timeout: 7200
      })
    })

    it('addNote adds note and refreshes alerts', async () => {
      (AlertsApi.addNote as jest.Mock).mockResolvedValue({})
      dispatch.mockResolvedValue(undefined)

      await actions.addNote({ commit, dispatch }, ['alert-1', 'my note'])
      expect(AlertsApi.addNote).toHaveBeenCalledWith('alert-1', { text: 'my note' })
      expect(dispatch).toHaveBeenCalledWith('getAlerts')
    })

    it('getNotes fetches and commits notes', async () => {
      (AlertsApi.getNotes as jest.Mock).mockResolvedValue({ notes: [{ id: 'n1', text: 'note' }] })

      await actions.getNotes({ commit }, 'alert-1')
      expect(commit).toHaveBeenCalledWith('SET_NOTES', [{ id: 'n1', text: 'note' }])
    })

    it('deleteAlert calls API delete', async () => {
      (AlertsApi.deleteAlert as jest.Mock).mockResolvedValue({})

      await actions.deleteAlert({ commit, dispatch }, 'alert-1')
      expect(AlertsApi.deleteAlert).toHaveBeenCalledWith('alert-1')
    })

    it('getEnvironments fetches and commits environments', async () => {
      const state = freshState();
      (AlertsApi.getEnvironments as jest.Mock).mockResolvedValue({
        environments: [{ environment: 'Production', count: 10 }]
      })

      await actions.getEnvironments({ commit, state })
      expect(commit).toHaveBeenCalledWith('SET_ENVIRONMENTS', [{ environment: 'Production', count: 10 }])
    })

    it('getServices fetches and commits services', async () => {
      (AlertsApi.getServices as jest.Mock).mockResolvedValue({
        services: [{ service: 'Web' }]
      })

      await actions.getServices({ commit })
      expect(commit).toHaveBeenCalledWith('SET_SERVICES', [{ service: 'Web' }])
    })

    it('getGroups fetches and commits groups', async () => {
      (AlertsApi.getGroups as jest.Mock).mockResolvedValue({
        groups: [{ group: 'Network' }]
      })

      await actions.getGroups({ commit })
      expect(commit).toHaveBeenCalledWith('SET_GROUPS', [{ group: 'Network' }])
    })

    it('getTags fetches and commits tags', async () => {
      (AlertsApi.getTags as jest.Mock).mockResolvedValue({
        tags: [{ tag: 'critical' }]
      })

      await actions.getTags({ commit })
      expect(commit).toHaveBeenCalledWith('SET_TAGS', [{ tag: 'critical' }])
    })

    it('setFilter commits filter', () => {
      actions.setFilter({ commit }, { environment: 'Production' })
      expect(commit).toHaveBeenCalledWith('SET_FILTER', { environment: 'Production' })
    })

    it('resetFilter commits config default filter', () => {
      actions.resetFilter({ commit, rootState })
      expect(commit).toHaveBeenCalledWith('SET_FILTER', rootState.config.filter)
    })

    it('setPagination commits pagination', () => {
      actions.setPagination({ commit }, { page: 2 })
      expect(commit).toHaveBeenCalledWith('SET_PAGINATION', { page: 2 })
    })

    it('setPanel commits panel state', () => {
      actions.setPanel({ commit }, true)
      expect(commit).toHaveBeenCalledWith('SET_PANEL', true)
    })

    it('toggle commits setting', () => {
      actions.toggle({ commit }, ['isWatch', true])
      expect(commit).toHaveBeenCalledWith('SET_SETTING', { s: 'isWatch', v: true })
    })

    it('set commits setting', () => {
      actions.set({ commit }, ['displayDensity', 'compact'])
      expect(commit).toHaveBeenCalledWith('SET_SETTING', { s: 'displayDensity', v: 'compact' })
    })
  })
})
