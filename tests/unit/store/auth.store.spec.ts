import {makeStore} from '@/store/modules/auth.store'

jest.mock('@/services/api/auth.service', () => ({
  __esModule: true,
  default: {
    confirm: jest.fn(),
    forgot: jest.fn(),
    reset: jest.fn()
  }
}))

import AuthApi from '@/services/api/auth.service'

function createMockVueAuth(overrides: any = {}) {
  return {
    isAuthenticated: jest.fn().mockReturnValue(false),
    getToken: jest.fn().mockReturnValue(null),
    getPayload: jest.fn().mockReturnValue({}),
    register: jest.fn().mockResolvedValue({}),
    login: jest.fn().mockResolvedValue({}),
    authenticate: jest.fn().mockResolvedValue({}),
    logout: jest.fn().mockResolvedValue({}),
    setToken: jest.fn(),
    options: {providers: {github: {}}},
    ...overrides
  }
}

describe('auth store', () => {
  describe('initial state', () => {
    it('reads initial auth state from vueAuth', () => {
      const vueAuth = createMockVueAuth({
        isAuthenticated: jest.fn().mockReturnValue(true),
        getToken: jest.fn().mockReturnValue('abc123'),
        getPayload: jest.fn().mockReturnValue({preferred_username: 'admin'})
      })
      const store = makeStore(vueAuth)

      expect(store.state.isAuthenticated).toBe(true)
      expect(store.state.token).toBe('abc123')
      expect(store.state.payload).toEqual({preferred_username: 'admin'})
      expect(store.state.isSending).toBe(false)
    })
  })

  describe('mutations', () => {
    let store: any

    beforeEach(() => {
      store = makeStore(createMockVueAuth())
    })

    it('SET_AUTH sets authenticated state', () => {
      const state = {...store.state}
      store.mutations.SET_AUTH(state, ['token123', {preferred_username: 'user1'}])
      expect(state.isAuthenticated).toBe(true)
      expect(state.token).toBe('token123')
      expect(state.payload).toEqual({preferred_username: 'user1'})
    })

    it('RESET_AUTH clears auth state', () => {
      const state = {isAuthenticated: true, token: 'abc', payload: {user: 'x'}, isSending: false}
      store.mutations.RESET_AUTH(state)
      expect(state.isAuthenticated).toBe(false)
      expect(state.token).toBeNull()
      expect(state.payload).toEqual({})
    })

    it('SET_SENDING sets sending flag', () => {
      const state = {...store.state}
      store.mutations.SET_SENDING(state)
      expect(state.isSending).toBe(true)
    })

    it('RESET_SENDING clears sending flag', () => {
      const state = {...store.state, isSending: true}
      store.mutations.RESET_SENDING(state)
      expect(state.isSending).toBe(false)
    })
  })

  describe('getters', () => {
    it('isLoggedIn reflects authentication state', () => {
      const store = makeStore(createMockVueAuth())
      expect(store.getters.isLoggedIn({isAuthenticated: false})).toBe(false)
      expect(store.getters.isLoggedIn({isAuthenticated: true})).toBe(true)
    })

    it('getUsername returns preferred_username from payload', () => {
      const store = makeStore(createMockVueAuth())
      expect(store.getters.getUsername({payload: {preferred_username: 'admin'}})).toBe('admin')
      expect(store.getters.getUsername({payload: {}})).toBeUndefined()
    })

    it('getAvatar returns picture from payload', () => {
      const store = makeStore(createMockVueAuth())
      expect(store.getters.getAvatar({payload: {picture: 'http://img/avatar.png'}})).toBe('http://img/avatar.png')
    })

    it('scopes splits scope string into array', () => {
      const store = makeStore(createMockVueAuth())
      expect(store.getters.scopes({payload: {scope: 'read write admin'}})).toEqual(['read', 'write', 'admin'])
      expect(store.getters.scopes({payload: {}})).toEqual([])
      expect(store.getters.scopes({payload: null})).toEqual([])
    })

    it('customers returns customer list or ALL wildcard', () => {
      const store = makeStore(createMockVueAuth())
      expect(store.getters.customers({payload: {customers: ['Acme']}})).toEqual(['Acme'])
      expect(store.getters.customers({payload: {customers: []}})).toEqual(['ALL (*)'])
    })

    it('isAdmin checks for admin scope when logged in', () => {
      const store = makeStore(createMockVueAuth())
      const mockGetters = {
        isLoggedIn: true,
        scopes: ['read', 'write', 'admin']
      }
      expect(store.getters.isAdmin({}, mockGetters)).toBe(true)

      mockGetters.scopes = ['read', 'write']
      expect(store.getters.isAdmin({}, mockGetters)).toBe(false)

      mockGetters.isLoggedIn = false
      mockGetters.scopes = ['admin']
      expect(store.getters.isAdmin({}, mockGetters)).toBe(false)
    })

    it('getOptions returns vueAuth options', () => {
      const vueAuth = createMockVueAuth()
      const store = makeStore(vueAuth)
      expect(store.getters.getOptions()).toBe(vueAuth.options)
    })
  })

  describe('actions', () => {
    let vueAuth: any
    let store: any
    let commit: jest.Mock
    let dispatch: jest.Mock

    beforeEach(() => {
      vueAuth = createMockVueAuth({
        getToken: jest.fn().mockReturnValue('new-token'),
        getPayload: jest.fn().mockReturnValue({preferred_username: 'user1', scope: 'read write'})
      })
      store = makeStore(vueAuth)
      commit = jest.fn()
      dispatch = jest.fn().mockResolvedValue(undefined)
    })

    it('signup registers, sets auth, and loads prefs', async () => {
      await store.actions.signup(
        {commit, dispatch},
        {
          name: 'Test',
          email: 'test@test.com',
          password: 'pass',
          text: ''
        }
      )
      expect(vueAuth.register).toHaveBeenCalledWith({
        name: 'Test',
        email: 'test@test.com',
        password: 'pass',
        text: ''
      })
      expect(commit).toHaveBeenCalledWith('SET_AUTH', ['new-token', expect.any(Object)])
      expect(dispatch).toHaveBeenCalledWith('getUserPrefs', {}, {root: true})
      expect(commit).toHaveBeenCalledWith('RESET_SENDING')
    })

    it('login authenticates and sets auth state', async () => {
      await store.actions.login({commit, dispatch}, {username: 'user', password: 'pass'})
      expect(vueAuth.login).toHaveBeenCalledWith({username: 'user', password: 'pass'})
      expect(commit).toHaveBeenCalledWith('SET_AUTH', ['new-token', expect.any(Object)])
      expect(dispatch).toHaveBeenCalledWith('getUserPrefs', {}, {root: true})
    })

    it('login rethrows on failure', async () => {
      vueAuth.login.mockRejectedValue(new Error('bad creds'))
      await expect(store.actions.login({commit, dispatch}, {username: 'user', password: 'wrong'})).rejects.toThrow(
        'bad creds'
      )
    })

    it('authenticate handles OAuth flow', async () => {
      await store.actions.authenticate({commit, dispatch}, 'github')
      expect(vueAuth.authenticate).toHaveBeenCalledWith('github')
      expect(commit).toHaveBeenCalledWith('SET_AUTH', ['new-token', expect.any(Object)])
    })

    it('setToken directly sets token and loads prefs', () => {
      store.actions.setToken({commit, dispatch}, 'direct-token')
      expect(vueAuth.setToken).toHaveBeenCalledWith('direct-token')
      expect(commit).toHaveBeenCalledWith('SET_AUTH', ['direct-token', expect.any(Object)])
      expect(dispatch).toHaveBeenCalledWith('getUserPrefs', {}, {root: true})
    })

    it('confirm calls auth API confirm', async () => {
      ;(AuthApi.confirm as jest.Mock).mockResolvedValue({ok: true})
      await store.actions.confirm({commit}, 'confirm-token')
      expect(AuthApi.confirm).toHaveBeenCalledWith('confirm-token')
    })

    it('forgot sends email and manages sending state', async () => {
      ;(AuthApi.forgot as jest.Mock).mockResolvedValue({})
      await store.actions.forgot({commit}, 'test@test.com')
      expect(commit).toHaveBeenCalledWith('SET_SENDING')
      expect(AuthApi.forgot).toHaveBeenCalledWith('test@test.com')
      expect(commit).toHaveBeenCalledWith('RESET_SENDING')
    })

    it('reset calls auth API reset', async () => {
      ;(AuthApi.reset as jest.Mock).mockResolvedValue({})
      await store.actions.reset({commit}, ['reset-token', 'newpass'])
      expect(AuthApi.reset).toHaveBeenCalledWith('reset-token', 'newpass')
    })

    it('logout clears auth state', async () => {
      await store.actions.logout({commit})
      expect(vueAuth.logout).toHaveBeenCalled()
      expect(commit).toHaveBeenCalledWith('RESET_AUTH')
    })
  })
})
