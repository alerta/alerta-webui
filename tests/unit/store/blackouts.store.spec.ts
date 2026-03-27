import blackoutsStore from '@/store/modules/blackouts.store'

jest.mock('@/services/api/blackout.service', () => ({
  __esModule: true,
  default: {
    getBlackouts: jest.fn(),
    createBlackout: jest.fn(),
    updateBlackout: jest.fn(),
    deleteBlackout: jest.fn()
  }
}))

import BlackoutsApi from '@/services/api/blackout.service'

const { mutations, actions } = blackoutsStore

function freshState() {
  return { isLoading: false, blackouts: [] }
}

describe('blackouts store', () => {
  describe('mutations', () => {
    it('SET_LOADING sets loading flag', () => {
      const state = freshState()
      mutations.SET_LOADING(state)
      expect(state.isLoading).toBe(true)
    })

    it('SET_BLACKOUTS stores blackouts and clears loading', () => {
      const state = freshState()
      state.isLoading = true
      const blackouts = [{ id: 'b1', environment: 'Production' }]
      mutations.SET_BLACKOUTS(state, blackouts)
      expect(state.isLoading).toBe(false)
      expect(state.blackouts).toEqual(blackouts)
    })

    it('RESET_LOADING clears loading flag', () => {
      const state = freshState()
      state.isLoading = true
      mutations.RESET_LOADING(state)
      expect(state.isLoading).toBe(false)
    })
  })

  describe('actions', () => {
    let commit: jest.Mock
    let dispatch: jest.Mock

    beforeEach(() => {
      commit = jest.fn()
      dispatch = jest.fn()
    })

    it('getBlackouts fetches and commits blackouts', async () => {
      (BlackoutsApi.getBlackouts as jest.Mock).mockResolvedValue({
        blackouts: [{ id: 'b1' }]
      })

      await actions.getBlackouts({ commit })
      expect(commit).toHaveBeenCalledWith('SET_LOADING')
      expect(commit).toHaveBeenCalledWith('SET_BLACKOUTS', [{ id: 'b1' }])
    })

    it('getBlackouts resets loading on failure', async () => {
      (BlackoutsApi.getBlackouts as jest.Mock).mockRejectedValue(new Error('fail'))

      await actions.getBlackouts({ commit })
      expect(commit).toHaveBeenCalledWith('RESET_LOADING')
    })

    it('createBlackout creates and refreshes list', async () => {
      (BlackoutsApi.createBlackout as jest.Mock).mockResolvedValue({})

      const blackout = { environment: 'Production', service: ['Web'] }
      await actions.createBlackout({ dispatch, commit }, blackout)
      expect(BlackoutsApi.createBlackout).toHaveBeenCalledWith(blackout)
      expect(dispatch).toHaveBeenCalledWith('getBlackouts')
    })

    it('updateBlackout updates and refreshes list', async () => {
      (BlackoutsApi.updateBlackout as jest.Mock).mockResolvedValue({})

      await actions.updateBlackout({ dispatch, commit }, ['b1', { duration: 3600 }])
      expect(BlackoutsApi.updateBlackout).toHaveBeenCalledWith('b1', { duration: 3600 })
      expect(dispatch).toHaveBeenCalledWith('getBlackouts')
    })

    it('deleteBlackout deletes and refreshes list', async () => {
      (BlackoutsApi.deleteBlackout as jest.Mock).mockResolvedValue({})

      await actions.deleteBlackout({ dispatch, commit }, 'b1')
      expect(BlackoutsApi.deleteBlackout).toHaveBeenCalledWith('b1')
      expect(dispatch).toHaveBeenCalledWith('getBlackouts')
    })
  })
})
