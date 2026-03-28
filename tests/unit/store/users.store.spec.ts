import usersStore from '@/store/modules/users.store'

jest.mock('@/services/api/user.service', () => ({
  __esModule: true,
  default: {
    getUsers: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    getGroups: jest.fn()
  }
}))

jest.mock('@/plugins/i18n', () => ({
  default: {t: (key: string) => key},
  t: (key: string) => key
}))

import UsersApi from '@/services/api/user.service'

const {mutations, actions} = usersStore

function freshState() {
  return {isLoading: false, domains: [], users: [], groups: []}
}

describe('users store', () => {
  describe('mutations', () => {
    it('SET_LOADING sets loading flag', () => {
      const state = freshState()
      mutations.SET_LOADING(state)
      expect(state.isLoading).toBe(true)
    })

    it('SET_USERS stores users and clears loading', () => {
      const state = freshState()
      state.isLoading = true
      const users = [{id: 'u1', name: 'Admin'}]
      mutations.SET_USERS(state, users)
      expect(state.isLoading).toBe(false)
      expect(state.users).toEqual(users)
    })

    it('SET_USER_GROUPS stores groups', () => {
      const state = freshState()
      const groups = [{id: 'g1', name: 'Ops'}]
      mutations.SET_USER_GROUPS(state, groups)
      expect(state.groups).toEqual(groups)
    })

    it('RESET_USER_GROUPS clears groups', () => {
      const state = freshState()
      state.groups = [{id: 'g1'}] as any
      mutations.RESET_USER_GROUPS(state)
      expect(state.groups).toEqual([])
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
      dispatch = jest.fn().mockResolvedValue(undefined)
    })

    it('getUsers fetches and commits users', async () => {
      ;(UsersApi.getUsers as jest.Mock).mockResolvedValue({
        users: [{id: 'u1', name: 'Admin'}]
      })

      await actions.getUsers({commit})
      expect(commit).toHaveBeenCalledWith('SET_LOADING')
      expect(commit).toHaveBeenCalledWith('SET_USERS', [{id: 'u1', name: 'Admin'}])
    })

    it('getUsers resets loading on failure', async () => {
      ;(UsersApi.getUsers as jest.Mock).mockRejectedValue(new Error('fail'))

      await actions.getUsers({commit})
      expect(commit).toHaveBeenCalledWith('RESET_LOADING')
    })

    it('createUser creates and refreshes list', async () => {
      ;(UsersApi.createUser as jest.Mock).mockResolvedValue({})

      const user = {name: 'New User', email: 'new@test.com'}
      await actions.createUser({dispatch, commit}, user)
      expect(UsersApi.createUser).toHaveBeenCalledWith(user)
      expect(dispatch).toHaveBeenCalledWith('getUsers')
    })

    it('updateUser updates and refreshes list', async () => {
      ;(UsersApi.updateUser as jest.Mock).mockResolvedValue({})

      await actions.updateUser({dispatch, commit}, ['u1', {name: 'Updated'}])
      expect(UsersApi.updateUser).toHaveBeenCalledWith('u1', {name: 'Updated'})
      expect(dispatch).toHaveBeenCalledWith('getUsers')
    })

    it('setUserStatus updates status and shows notification', async () => {
      ;(UsersApi.updateUser as jest.Mock).mockResolvedValue({})

      await actions.setUserStatus({dispatch, commit}, ['u1', 'active'])
      expect(UsersApi.updateUser).toHaveBeenCalledWith('u1', {status: 'active'})
      expect(dispatch).toHaveBeenCalledWith('getUsers')
      expect(dispatch).toHaveBeenCalledWith('notifications/success', 'UserStatusSaved', {root: true})
    })

    it('setEmailVerified updates verification and shows notification', async () => {
      ;(UsersApi.updateUser as jest.Mock).mockResolvedValue({})

      await actions.setEmailVerified({dispatch, commit}, ['u1', true])
      expect(UsersApi.updateUser).toHaveBeenCalledWith('u1', {email_verified: true})
      expect(dispatch).toHaveBeenCalledWith('notifications/success', 'EmailSaved', {root: true})
    })

    it('deleteUser deletes and refreshes list', async () => {
      ;(UsersApi.deleteUser as jest.Mock).mockResolvedValue({})

      await actions.deleteUser({dispatch, commit}, 'u1')
      expect(UsersApi.deleteUser).toHaveBeenCalledWith('u1')
      expect(dispatch).toHaveBeenCalledWith('getUsers')
    })

    it('getUserGroups fetches and commits user groups', async () => {
      ;(UsersApi.getGroups as jest.Mock).mockResolvedValue({
        groups: [{id: 'g1', name: 'Ops'}]
      })

      await actions.getUserGroups({dispatch, commit}, 'u1')
      expect(commit).toHaveBeenCalledWith('SET_USER_GROUPS', [{id: 'g1', name: 'Ops'}])
    })

    it('resetUserGroups clears groups', () => {
      actions.resetUserGroups({commit})
      expect(commit).toHaveBeenCalledWith('RESET_USER_GROUPS')
    })
  })
})
