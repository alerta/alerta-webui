import preferencesStore from '@/store/modules/preferences.store'

jest.mock('@/services/api/user.service', () => ({
  __esModule: true,
  default: {
    getMeAttributes: jest.fn(),
    updateMeAttributes: jest.fn()
  }
}))

jest.mock('vue-object-merge', () => {
  return (state: any, prefs: any) => Object.assign(state, prefs)
})

jest.mock('@/plugins/i18n', () => ({
  default: { locale: 'en', t: (key: string) => key },
  locale: 'en',
  t: (key: string) => key
}))

import UsersApi from '@/services/api/user.service'

const { state: defaultState, mutations, actions, getters } = preferencesStore

function freshState() {
  return JSON.parse(JSON.stringify(defaultState))
}

describe('preferences store', () => {
  describe('default state', () => {
    it('has expected defaults', () => {
      expect(defaultState.isDark).toBe(false)
      expect(defaultState.isMute).toBe(true)
      expect(defaultState.timezone).toBe('local')
      expect(defaultState.rowsPerPage).toBe(20)
      expect(defaultState.refreshInterval).toBe(5000)
    })
  })

  describe('mutations', () => {
    it('SET_PREFS merges preferences', () => {
      const state = freshState()
      mutations.SET_PREFS(state, { isDark: true, rowsPerPage: 50 })
      expect(state.isDark).toBe(true)
      expect(state.rowsPerPage).toBe(50)
      expect(state.isMute).toBe(true) // unchanged
    })

    it('RESET_PREFS restores defaults but keeps queries', () => {
      const state = freshState()
      state.isDark = true
      state.queries = [{ text: 'saved query' }] as any
      mutations.RESET_PREFS(state)
      expect(state.isDark).toBe(false)
      expect(state.queries).toEqual([{ text: 'saved query' }])
    })

    it('SET_QUERIES sets queries', () => {
      const state = freshState()
      mutations.SET_QUERIES(state, [{ text: 'q1' }])
      expect(state.queries).toEqual([{ text: 'q1' }])
    })

    it('SET_QUERIES handles null by setting empty array', () => {
      const state = freshState()
      mutations.SET_QUERIES(state, null)
      expect(state.queries).toEqual([])
    })

    it('RESET_QUERIES clears queries', () => {
      const state = freshState()
      state.queries = [{ text: 'q1' }] as any
      mutations.RESET_QUERIES(state)
      expect(state.queries).toEqual([])
    })
  })

  describe('getters', () => {
    it('getPreference returns a specific preference value', () => {
      const state = freshState()
      const getter = getters.getPreference(state)
      expect(getter('isDark')).toBe(false)
      expect(getter('rowsPerPage')).toBe(20)
      expect(getter('timezone')).toBe('local')
    })

    it('getUserQueries returns queries or empty array', () => {
      const state = freshState()
      state.queries = [{ text: 'q1' }] as any
      expect(getters.getUserQueries(state)).toEqual([{ text: 'q1' }])

      state.queries = null as any
      expect(getters.getUserQueries(state)).toEqual([])
    })
  })

  describe('actions', () => {
    let commit: jest.Mock
    let dispatch: jest.Mock

    beforeEach(() => {
      commit = jest.fn()
      dispatch = jest.fn().mockResolvedValue(undefined)
    })

    it('getUserPrefs fetches and commits preferences', async () => {
      (UsersApi.getMeAttributes as jest.Mock).mockResolvedValue({
        attributes: { prefs: { isDark: true } }
      })

      await actions.getUserPrefs({ dispatch, commit })
      expect(commit).toHaveBeenCalledWith('SET_PREFS', { isDark: true })
    })

    it('getUserPrefs dispatches error notification on failure', async () => {
      (UsersApi.getMeAttributes as jest.Mock).mockRejectedValue(new Error('fail'))

      await actions.getUserPrefs({ dispatch, commit })
      expect(dispatch).toHaveBeenCalledWith('notifications/error', expect.any(Error), { root: true })
    })

    it('toggle updates a single preference', async () => {
      (UsersApi.updateMeAttributes as jest.Mock).mockResolvedValue({})

      await actions.toggle({ dispatch, commit }, ['isDark', true])
      expect(UsersApi.updateMeAttributes).toHaveBeenCalledWith({ prefs: { isDark: true } })
      expect(dispatch).toHaveBeenCalledWith('getUserPrefs')
      expect(dispatch).toHaveBeenCalledWith('notifications/success', 'SettingsSaved', { root: true })
    })

    it('setUserPrefs updates multiple preferences', async () => {
      (UsersApi.updateMeAttributes as jest.Mock).mockResolvedValue({})

      await actions.setUserPrefs({ dispatch, commit }, { isDark: true, rowsPerPage: 50 })
      expect(UsersApi.updateMeAttributes).toHaveBeenCalledWith({
        prefs: { isDark: true, rowsPerPage: 50 }
      })
    })

    it('resetUserPrefs clears prefs and notifies', async () => {
      (UsersApi.updateMeAttributes as jest.Mock).mockResolvedValue({})

      await actions.resetUserPrefs({ dispatch, commit })
      expect(UsersApi.updateMeAttributes).toHaveBeenCalledWith({ prefs: null })
      expect(commit).toHaveBeenCalledWith('RESET_PREFS')
      expect(dispatch).toHaveBeenCalledWith('notifications/success', 'SettingsReset', { root: true })
    })

    it('clearUserPrefs resets locally without API call', () => {
      actions.clearUserPrefs({ commit })
      expect(commit).toHaveBeenCalledWith('RESET_PREFS')
    })

    it('getUserQueries fetches and commits queries', async () => {
      (UsersApi.getMeAttributes as jest.Mock).mockResolvedValue({
        attributes: { queries: [{ text: 'q1' }] }
      })

      await actions.getUserQueries({ dispatch, commit })
      expect(commit).toHaveBeenCalledWith('SET_QUERIES', [{ text: 'q1' }])
    })

    it('addUserQuery deduplicates and appends query', async () => {
      (UsersApi.updateMeAttributes as jest.Mock).mockResolvedValue({})
      const state = freshState()
      state.queries = [{ text: 'existing' }] as any

      await actions.addUserQuery({ dispatch, state }, { text: 'new query' })
      expect(UsersApi.updateMeAttributes).toHaveBeenCalledWith({
        queries: [{ text: 'existing' }, { text: 'new query' }]
      })
    })

    it('addUserQuery replaces query with same text', async () => {
      (UsersApi.updateMeAttributes as jest.Mock).mockResolvedValue({})
      const state = freshState()
      state.queries = [{ text: 'query1' }] as any

      await actions.addUserQuery({ dispatch, state }, { text: 'query1' })
      expect(UsersApi.updateMeAttributes).toHaveBeenCalledWith({
        queries: [{ text: 'query1' }]
      })
    })

    it('removeUserQuery filters out matching query', async () => {
      (UsersApi.updateMeAttributes as jest.Mock).mockResolvedValue({})
      const state = freshState()
      state.queries = [{ text: 'keep' }, { text: 'remove' }] as any

      await actions.removeUserQuery({ dispatch, state }, { text: 'remove' })
      expect(UsersApi.updateMeAttributes).toHaveBeenCalledWith({
        queries: [{ text: 'keep' }]
      })
    })

    it('resetUserQueries clears all queries', async () => {
      (UsersApi.updateMeAttributes as jest.Mock).mockResolvedValue({})

      await actions.resetUserQueries({ dispatch, commit })
      expect(UsersApi.updateMeAttributes).toHaveBeenCalledWith({ queries: null })
      expect(commit).toHaveBeenCalledWith('RESET_QUERIES')
    })
  })
})
