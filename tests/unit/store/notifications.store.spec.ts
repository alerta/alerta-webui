import notificationsStore from '@/store/modules/notifications.store'

const { state: defaultState, mutations, actions, getters } = notificationsStore

function freshState() {
  return { snackbars: [], banners: [] }
}

describe('notifications store', () => {
  describe('mutations', () => {
    it('ADD_SNACKBAR appends a snackbar', () => {
      const state = freshState()
      mutations.ADD_SNACKBAR(state, { type: 'success', text: 'Done' })
      expect(state.snackbars).toHaveLength(1)
      expect(state.snackbars[0]).toEqual({ type: 'success', text: 'Done' })
    })

    it('ADD_SNACKBAR prevents duplicate text', () => {
      const state = freshState()
      mutations.ADD_SNACKBAR(state, { type: 'success', text: 'Done' })
      mutations.ADD_SNACKBAR(state, { type: 'success', text: 'Done' })
      expect(state.snackbars).toHaveLength(1)
    })

    it('ADD_SNACKBAR allows different texts', () => {
      const state = freshState()
      mutations.ADD_SNACKBAR(state, { type: 'success', text: 'First' })
      mutations.ADD_SNACKBAR(state, { type: 'error', text: 'Second' })
      expect(state.snackbars).toHaveLength(2)
    })

    it('REMOVE_SNACKBAR removes the first snackbar', () => {
      const state = freshState()
      mutations.ADD_SNACKBAR(state, { text: 'First' })
      mutations.ADD_SNACKBAR(state, { text: 'Second' })
      mutations.REMOVE_SNACKBAR(state)
      expect(state.snackbars).toHaveLength(1)
      expect(state.snackbars[0]['text']).toBe('Second')
    })

    it('ADD_BANNER appends a banner', () => {
      const state = freshState()
      mutations.ADD_BANNER(state, { type: 'warning', text: 'Maintenance' })
      expect(state.banners).toHaveLength(1)
    })

    it('ADD_BANNER prevents duplicate text', () => {
      const state = freshState()
      mutations.ADD_BANNER(state, { type: 'warning', text: 'Same' })
      mutations.ADD_BANNER(state, { type: 'warning', text: 'Same' })
      expect(state.banners).toHaveLength(1)
    })

    it('REMOVE_BANNER removes the first banner', () => {
      const state = freshState()
      mutations.ADD_BANNER(state, { text: 'First' })
      mutations.ADD_BANNER(state, { text: 'Second' })
      mutations.REMOVE_BANNER(state)
      expect(state.banners).toHaveLength(1)
      expect(state.banners[0]['text']).toBe('Second')
    })
  })

  describe('getters', () => {
    it('hasSnackbar returns true when snackbars exist', () => {
      expect(getters.hasSnackbar({ snackbars: [{ text: 'x' }], banners: [] })).toBe(true)
      expect(getters.hasSnackbar({ snackbars: [], banners: [] })).toBe(false)
    })

    it('hasBanners returns true when banners exist', () => {
      expect(getters.hasBanners({ snackbars: [], banners: [{ text: 'x' }] })).toBe(true)
      expect(getters.hasBanners({ snackbars: [], banners: [] })).toBe(false)
    })
  })

  describe('actions', () => {
    let commit: jest.Mock

    beforeEach(() => {
      commit = jest.fn()
    })

    it('showSnackbar commits ADD_SNACKBAR', () => {
      const snackbar = { type: 'info', text: 'Hello' }
      actions.showSnackbar({ commit }, snackbar)
      expect(commit).toHaveBeenCalledWith('ADD_SNACKBAR', snackbar)
    })

    it('closeSnackbar commits REMOVE_SNACKBAR', () => {
      actions.closeSnackbar({ commit })
      expect(commit).toHaveBeenCalledWith('REMOVE_SNACKBAR')
    })

    it('showBanner commits ADD_BANNER', () => {
      const banner = { type: 'warning', text: 'Alert' }
      actions.showBanner({ commit }, banner)
      expect(commit).toHaveBeenCalledWith('ADD_BANNER', banner)
    })

    it('closeBanner commits REMOVE_BANNER', () => {
      actions.closeBanner({ commit })
      expect(commit).toHaveBeenCalledWith('REMOVE_BANNER')
    })

    it('success creates a success snackbar', () => {
      actions.success({ commit }, 'Saved!')
      expect(commit).toHaveBeenCalledWith('ADD_SNACKBAR', {
        type: 'success',
        text: 'Saved!',
        action: 'OK',
        timeout: 3000
      })
    })

    it('error creates snackbar from HTTP error with code', () => {
      actions.error({ commit }, { code: 403, message: 'Forbidden', status: 'error' })
      expect(commit).toHaveBeenCalledWith('ADD_SNACKBAR', {
        type: 'error',
        text: 'Forbidden (403)',
        action: 'CLOSE',
        timeout: 5000
      })
    })

    it('error creates snackbar from generic Error', () => {
      actions.error({ commit }, new Error('Network failure'))
      expect(commit).toHaveBeenCalledWith('ADD_SNACKBAR', {
        type: 'error',
        text: 'Error: Network failure',
        action: 'CLOSE',
        timeout: 5000
      })
    })
  })
})
