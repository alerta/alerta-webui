import heartbeatsStore from '@/store/modules/heartbeats.store'

jest.mock('@/services/api/heartbeat.service', () => ({
  __esModule: true,
  default: {
    getHeartbeats: jest.fn(),
    deleteHeartbeat: jest.fn()
  }
}))

import HeartbeatsApi from '@/services/api/heartbeat.service'

const {mutations, actions} = heartbeatsStore

function freshState() {
  return {isLoading: false, heartbeats: []}
}

describe('heartbeats store', () => {
  describe('mutations', () => {
    it('SET_LOADING sets loading flag', () => {
      const state = freshState()
      mutations.SET_LOADING(state)
      expect(state.isLoading).toBe(true)
    })

    it('SET_HEARTBEATS stores heartbeats and clears loading', () => {
      const state = freshState()
      state.isLoading = true
      const heartbeats = [{id: 'h1', origin: 'web01'}]
      mutations.SET_HEARTBEATS(state, heartbeats)
      expect(state.isLoading).toBe(false)
      expect(state.heartbeats).toEqual(heartbeats)
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

    it('getHeartbeats fetches and commits heartbeats', async () => {
      ;(HeartbeatsApi.getHeartbeats as jest.Mock).mockResolvedValue({
        heartbeats: [{id: 'h1', origin: 'web01'}]
      })

      await actions.getHeartbeats({commit})
      expect(commit).toHaveBeenCalledWith('SET_LOADING')
      expect(commit).toHaveBeenCalledWith('SET_HEARTBEATS', [{id: 'h1', origin: 'web01'}])
    })

    it('getHeartbeats resets loading on failure', async () => {
      ;(HeartbeatsApi.getHeartbeats as jest.Mock).mockRejectedValue(new Error('fail'))

      await actions.getHeartbeats({commit})
      expect(commit).toHaveBeenCalledWith('RESET_LOADING')
    })

    it('deleteHeartbeat deletes and refreshes list', async () => {
      ;(HeartbeatsApi.deleteHeartbeat as jest.Mock).mockResolvedValue({})

      await actions.deleteHeartbeat({dispatch, commit}, 'h1')
      expect(HeartbeatsApi.deleteHeartbeat).toHaveBeenCalledWith('h1')
      expect(dispatch).toHaveBeenCalledWith('getHeartbeats')
    })
  })
})
