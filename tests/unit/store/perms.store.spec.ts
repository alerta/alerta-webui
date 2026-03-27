import permsStore from '@/store/modules/perms.store'

jest.mock('@/services/api/perms.service', () => ({
  __esModule: true,
  default: {
    getPerms: jest.fn(),
    createPerm: jest.fn(),
    updatePerm: jest.fn(),
    deletePerm: jest.fn(),
    getScopes: jest.fn()
  }
}))

import PermsApi from '@/services/api/perms.service'

const { mutations, actions, getters } = permsStore

function freshState() {
  return { isLoading: false, permissions: [], scopes: [] }
}

describe('perms store', () => {
  describe('mutations', () => {
    it('SET_PERMS stores permissions and clears loading', () => {
      const state = freshState()
      state.isLoading = true
      mutations.SET_PERMS(state, [{ id: 'p1', match: 'admin' }])
      expect(state.isLoading).toBe(false)
      expect(state.permissions).toHaveLength(1)
    })

    it('SET_SCOPES stores scopes and clears loading', () => {
      const state = freshState()
      state.isLoading = true
      mutations.SET_SCOPES(state, ['read', 'write', 'admin'])
      expect(state.isLoading).toBe(false)
      expect(state.scopes).toEqual(['read', 'write', 'admin'])
    })
  })

  describe('getters', () => {
    it('roles extracts match field from permissions', () => {
      const state = {
        permissions: [
          { id: 'p1', match: 'admin' },
          { id: 'p2', match: 'user' },
          { id: 'p3', match: 'guest' }
        ]
      }
      expect(getters.roles(state)).toEqual(['admin', 'user', 'guest'])
    })

    it('roles returns empty array for no permissions', () => {
      expect(getters.roles({ permissions: [] })).toEqual([])
    })
  })

  describe('actions', () => {
    let commit: jest.Mock
    let dispatch: jest.Mock

    beforeEach(() => {
      commit = jest.fn()
      dispatch = jest.fn()
    })

    it('getPerms fetches and commits permissions', async () => {
      (PermsApi.getPerms as jest.Mock).mockResolvedValue({ permissions: [{ id: 'p1' }] })

      await actions.getPerms({ commit })
      expect(commit).toHaveBeenCalledWith('SET_LOADING')
      expect(commit).toHaveBeenCalledWith('SET_PERMS', [{ id: 'p1' }])
    })

    it('getPerms resets loading on failure', async () => {
      (PermsApi.getPerms as jest.Mock).mockRejectedValue(new Error('fail'))

      await actions.getPerms({ commit })
      expect(commit).toHaveBeenCalledWith('RESET_LOADING')
    })

    it('createPerm creates and refreshes list', async () => {
      (PermsApi.createPerm as jest.Mock).mockResolvedValue({})

      await actions.createPerm({ dispatch, commit }, { match: 'ops', scopes: ['read'] })
      expect(PermsApi.createPerm).toHaveBeenCalledWith({ match: 'ops', scopes: ['read'] })
      expect(dispatch).toHaveBeenCalledWith('getPerms')
    })

    it('updatePerm updates and refreshes list', async () => {
      (PermsApi.updatePerm as jest.Mock).mockResolvedValue({})

      await actions.updatePerm({ dispatch, commit }, ['p1', { scopes: ['read', 'write'] }])
      expect(PermsApi.updatePerm).toHaveBeenCalledWith('p1', { scopes: ['read', 'write'] })
      expect(dispatch).toHaveBeenCalledWith('getPerms')
    })

    it('deletePerm deletes and refreshes list', async () => {
      (PermsApi.deletePerm as jest.Mock).mockResolvedValue({})

      await actions.deletePerm({ dispatch, commit }, 'p1')
      expect(PermsApi.deletePerm).toHaveBeenCalledWith('p1')
      expect(dispatch).toHaveBeenCalledWith('getPerms')
    })

    it('getScopes fetches and commits scopes', async () => {
      (PermsApi.getScopes as jest.Mock).mockResolvedValue({ scopes: ['read', 'write'] })

      await actions.getScopes({ commit })
      expect(commit).toHaveBeenCalledWith('SET_LOADING')
      expect(commit).toHaveBeenCalledWith('SET_SCOPES', ['read', 'write'])
    })
  })
})
