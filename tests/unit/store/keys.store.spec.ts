import keysStore from '@/store/modules/keys.store'

jest.mock('@/services/api/key.service', () => ({
  __esModule: true,
  default: {
    getKeys: jest.fn(),
    createKey: jest.fn(),
    updateKey: jest.fn(),
    deleteKey: jest.fn()
  }
}))

import KeysApi from '@/services/api/key.service'

const { mutations, actions } = keysStore

function freshState() {
  return { isLoading: false, keys: [] }
}

describe('keys store', () => {
  describe('mutations', () => {
    it('SET_KEYS stores keys and clears loading', () => {
      const state = freshState()
      state.isLoading = true
      mutations.SET_KEYS(state, [{ id: 'k1', key: 'abc123' }])
      expect(state.isLoading).toBe(false)
      expect(state.keys).toHaveLength(1)
    })
  })

  describe('actions', () => {
    let commit: jest.Mock
    let dispatch: jest.Mock

    beforeEach(() => {
      commit = jest.fn()
      dispatch = jest.fn()
    })

    it('getKeys fetches and commits keys', async () => {
      (KeysApi.getKeys as jest.Mock).mockResolvedValue({ keys: [{ id: 'k1' }] })

      await actions.getKeys({ commit, dispatch })
      expect(commit).toHaveBeenCalledWith('SET_LOADING')
      expect(commit).toHaveBeenCalledWith('SET_KEYS', [{ id: 'k1' }])
    })

    it('getKeys resets loading on failure', async () => {
      (KeysApi.getKeys as jest.Mock).mockRejectedValue(new Error('fail'))

      await actions.getKeys({ commit, dispatch })
      expect(commit).toHaveBeenCalledWith('RESET_LOADING')
    })

    it('createKey creates and refreshes list', async () => {
      (KeysApi.createKey as jest.Mock).mockResolvedValue({})

      await actions.createKey({ dispatch, commit }, { text: 'My Key' })
      expect(KeysApi.createKey).toHaveBeenCalledWith({ text: 'My Key' })
      expect(dispatch).toHaveBeenCalledWith('getKeys')
    })

    it('updateKey updates and refreshes list', async () => {
      (KeysApi.updateKey as jest.Mock).mockResolvedValue({})

      await actions.updateKey({ dispatch, commit }, ['k1', { text: 'Updated' }])
      expect(KeysApi.updateKey).toHaveBeenCalledWith('k1', { text: 'Updated' })
      expect(dispatch).toHaveBeenCalledWith('getKeys')
    })

    it('deleteKey deletes and refreshes list', async () => {
      (KeysApi.deleteKey as jest.Mock).mockResolvedValue({})

      await actions.deleteKey({ dispatch, commit }, 'k1')
      expect(KeysApi.deleteKey).toHaveBeenCalledWith('k1')
      expect(dispatch).toHaveBeenCalledWith('getKeys')
    })
  })
})
