import configStore from '@/store/modules/config.store'

jest.mock('vue-object-merge', () => {
  return (state: any, config: any) => Object.assign(state, config)
})

const {state: defaultState, mutations, actions, getters} = configStore

function freshState() {
  return JSON.parse(JSON.stringify(defaultState))
}

describe('config store', () => {
  describe('default state', () => {
    it('has expected defaults', () => {
      expect(defaultState.endpoint).toBe('http://local.alerta.io:8080')
      expect(defaultState.auth_required).toBe(true)
      expect(defaultState.provider).toBe('basic')
      expect(defaultState.signup_enabled).toBe(true)
      expect(defaultState.refresh_interval).toBe(5000)
      expect(defaultState.sort_by).toEqual(['severity', 'lastReceiveTime'])
    })
  })

  describe('mutations', () => {
    it('SET_CONFIG merges config into state', () => {
      const state = freshState()
      mutations.SET_CONFIG(state, {
        endpoint: 'http://api.example.com',
        auth_required: false
      })
      expect(state.endpoint).toBe('http://api.example.com')
      expect(state.auth_required).toBe(false)
      expect(state.provider).toBe('basic') // unchanged
    })

    it('SET_CONFIG merges nested objects', () => {
      const state = freshState()
      mutations.SET_CONFIG(state, {
        dates: {longDate: 'YYYY-MM-DD HH:mm:ss'}
      })
      expect(state.dates.longDate).toBe('YYYY-MM-DD HH:mm:ss')
    })
  })

  describe('getters', () => {
    it('getConfig returns a specific setting', () => {
      const state = freshState()
      const getter = getters.getConfig(state)
      expect(getter('endpoint')).toBe('http://local.alerta.io:8080')
      expect(getter('auth_required')).toBe(true)
      expect(getter('refresh_interval')).toBe(5000)
    })

    it('getConfig returns undefined for unknown setting', () => {
      const state = freshState()
      const getter = getters.getConfig(state)
      expect(getter('nonexistent')).toBeUndefined()
    })
  })

  describe('actions', () => {
    it('updateConfig commits SET_CONFIG', () => {
      const commit = jest.fn()
      const config = {endpoint: 'http://new.api.com'}
      actions.updateConfig({commit}, config)
      expect(commit).toHaveBeenCalledWith('SET_CONFIG', config)
    })
  })
})
