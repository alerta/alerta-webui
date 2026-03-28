import reportsStore from '@/store/modules/reports.store'

jest.mock('@/services/api/alert.service', () => ({
  __esModule: true,
  default: {
    getTop10Count: jest.fn(),
    getTop10Flapping: jest.fn(),
    getTop10Standing: jest.fn()
  }
}))

import AlertsApi from '@/services/api/alert.service'

const {mutations, actions} = reportsStore

function freshState() {
  return JSON.parse(JSON.stringify(reportsStore.state))
}

describe('reports store', () => {
  describe('mutations', () => {
    it('SET_TOP_OFFENDERS stores offenders', () => {
      const state = freshState()
      const top10 = [{resource: 'web01', count: 50}]
      mutations.SET_TOP_OFFENDERS(state, top10)
      expect(state.offenders).toEqual(top10)
    })

    it('SET_TOP_FLAPPING stores flapping alerts', () => {
      const state = freshState()
      const top10 = [{resource: 'db01', count: 30}]
      mutations.SET_TOP_FLAPPING(state, top10)
      expect(state.flapping).toEqual(top10)
    })

    it('SET_TOP_STANDING stores standing alerts', () => {
      const state = freshState()
      const top10 = [{resource: 'app01', count: 20}]
      mutations.SET_TOP_STANDING(state, top10)
      expect(state.standing).toEqual(top10)
    })

    it('SET_FILTER merges filter values', () => {
      const state = freshState()
      mutations.SET_FILTER(state, {environment: 'Production'})
      expect(state.filter.environment).toBe('Production')
      expect(state.filter.status).toEqual(['open', 'ack']) // unchanged
    })

    it('SET_PAGE_SIZE updates rows per page', () => {
      const state = freshState()
      mutations.SET_PAGE_SIZE(state, 25)
      expect(state.pagination.rowsPerPage).toBe(25)
    })
  })

  describe('actions', () => {
    let commit: jest.Mock

    beforeEach(() => {
      commit = jest.fn()
    })

    it('getTopOffenders fetches and commits offenders', async () => {
      const state = freshState()
      ;(AlertsApi.getTop10Count as jest.Mock).mockResolvedValue({top10: [{resource: 'w1'}]})

      await actions.getTopOffenders({commit, state})
      expect(commit).toHaveBeenCalledWith('SET_TOP_OFFENDERS', [{resource: 'w1'}])
    })

    it('getTopFlapping fetches and commits flapping', async () => {
      const state = freshState()
      ;(AlertsApi.getTop10Flapping as jest.Mock).mockResolvedValue({top10: [{resource: 'w1'}]})

      await actions.getTopFlapping({commit, state})
      expect(commit).toHaveBeenCalledWith('SET_TOP_FLAPPING', [{resource: 'w1'}])
    })

    it('getTopStanding fetches and commits standing', async () => {
      const state = freshState()
      ;(AlertsApi.getTop10Standing as jest.Mock).mockResolvedValue({top10: [{resource: 'w1'}]})

      await actions.getTopStanding({commit, state})
      expect(commit).toHaveBeenCalledWith('SET_TOP_STANDING', [{resource: 'w1'}])
    })

    it('setFilter commits filter', () => {
      actions.setFilter({commit}, {environment: 'Dev'})
      expect(commit).toHaveBeenCalledWith('SET_FILTER', {environment: 'Dev'})
    })

    it('resetFilter resets to config defaults', () => {
      const rootState = {config: {filter: {status: null}}}
      actions.resetFilter({commit, rootState})
      expect(commit).toHaveBeenCalledWith('SET_FILTER', rootState.config.filter)
    })

    it('setPageSize commits page size', () => {
      actions.setPageSize({commit}, 50)
      expect(commit).toHaveBeenCalledWith('SET_PAGE_SIZE', 50)
    })
  })
})
