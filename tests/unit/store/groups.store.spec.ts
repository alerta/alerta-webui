import groupsStore from '@/store/modules/groups.store'

jest.mock('@/services/api/group.service', () => ({
  __esModule: true,
  default: {
    getGroups: jest.fn(),
    getGroup: jest.fn(),
    getGroupUsers: jest.fn(),
    createGroup: jest.fn(),
    updateGroup: jest.fn(),
    addUserToGroup: jest.fn(),
    removeUserFromGroup: jest.fn(),
    deleteGroup: jest.fn()
  }
}))

jest.mock('@/plugins/i18n', () => ({
  default: { t: (key: string) => key },
  t: (key: string) => key
}))

import GroupsApi from '@/services/api/group.service'

const { mutations, actions } = groupsStore

function freshState() {
  return { isLoading: false, groups: [], group: {}, users: [] }
}

describe('groups store', () => {
  describe('mutations', () => {
    it('SET_GROUPS stores groups and clears loading', () => {
      const state = freshState()
      state.isLoading = true
      mutations.SET_GROUPS(state, [{ id: 'g1', name: 'Ops' }])
      expect(state.isLoading).toBe(false)
      expect(state.groups).toHaveLength(1)
    })

    it('SET_GROUP stores a single group', () => {
      const state = freshState()
      mutations.SET_GROUP(state, { id: 'g1', name: 'Ops' })
      expect(state.group).toEqual({ id: 'g1', name: 'Ops' })
    })

    it('SET_GROUP_USERS stores users and clears loading', () => {
      const state = freshState()
      state.isLoading = true
      mutations.SET_GROUP_USERS(state, [{ id: 'u1' }])
      expect(state.isLoading).toBe(false)
      expect(state.users).toHaveLength(1)
    })

    it('RESET_GROUP_USERS clears users', () => {
      const state = freshState()
      state.users = [{ id: 'u1' }] as any
      mutations.RESET_GROUP_USERS(state)
      expect(state.users).toEqual([])
    })
  })

  describe('actions', () => {
    let commit: jest.Mock
    let dispatch: jest.Mock

    beforeEach(() => {
      commit = jest.fn()
      dispatch = jest.fn().mockResolvedValue(undefined)
    })

    it('getGroups fetches and commits groups', async () => {
      (GroupsApi.getGroups as jest.Mock).mockResolvedValue({ groups: [{ id: 'g1' }] })

      await actions.getGroups({ commit })
      expect(commit).toHaveBeenCalledWith('SET_LOADING')
      expect(commit).toHaveBeenCalledWith('SET_GROUPS', [{ id: 'g1' }])
    })

    it('getGroups resets loading on failure', async () => {
      (GroupsApi.getGroups as jest.Mock).mockRejectedValue(new Error('fail'))

      await actions.getGroups({ commit })
      expect(commit).toHaveBeenCalledWith('RESET_LOADING')
    })

    it('getGroup fetches and commits a single group', async () => {
      (GroupsApi.getGroup as jest.Mock).mockResolvedValue({ group: { id: 'g1', name: 'Ops' } })

      await actions.getGroup({ commit }, 'g1')
      expect(commit).toHaveBeenCalledWith('SET_GROUP', { id: 'g1', name: 'Ops' })
    })

    it('getGroupUsers fetches and commits group users', async () => {
      (GroupsApi.getGroupUsers as jest.Mock).mockResolvedValue({ users: [{ id: 'u1' }] })

      await actions.getGroupUsers({ commit }, 'g1')
      expect(commit).toHaveBeenCalledWith('SET_LOADING')
      expect(commit).toHaveBeenCalledWith('SET_GROUP_USERS', [{ id: 'u1' }])
    })

    it('clearGroupUsers resets users', () => {
      actions.clearGroupUsers({ commit })
      expect(commit).toHaveBeenCalledWith('RESET_GROUP_USERS')
    })

    it('createGroup creates and refreshes list', async () => {
      (GroupsApi.createGroup as jest.Mock).mockResolvedValue({})

      await actions.createGroup({ dispatch, commit }, { name: 'NewGroup' })
      expect(GroupsApi.createGroup).toHaveBeenCalledWith({ name: 'NewGroup' })
      expect(dispatch).toHaveBeenCalledWith('getGroups')
    })

    it('updateGroup updates and refreshes list', async () => {
      (GroupsApi.updateGroup as jest.Mock).mockResolvedValue({})

      await actions.updateGroup({ dispatch, commit }, ['g1', { name: 'Updated' }])
      expect(GroupsApi.updateGroup).toHaveBeenCalledWith('g1', { name: 'Updated' })
      expect(dispatch).toHaveBeenCalledWith('getGroups')
    })

    it('addUserToGroup adds user, refreshes, and notifies', async () => {
      (GroupsApi.addUserToGroup as jest.Mock).mockResolvedValue({})

      await actions.addUserToGroup({ dispatch, commit }, ['g1', 'u1'])
      expect(GroupsApi.addUserToGroup).toHaveBeenCalledWith('g1', 'u1')
      expect(dispatch).toHaveBeenCalledWith('getGroupUsers', 'g1')
      expect(dispatch).toHaveBeenCalledWith('notifications/success', 'UserAddedGroup', { root: true })
    })

    it('removeUserFromGroup removes user, refreshes, and notifies', async () => {
      (GroupsApi.removeUserFromGroup as jest.Mock).mockResolvedValue({})

      await actions.removeUserFromGroup({ dispatch, commit }, ['g1', 'u1'])
      expect(GroupsApi.removeUserFromGroup).toHaveBeenCalledWith('g1', 'u1')
      expect(dispatch).toHaveBeenCalledWith('getGroupUsers', 'g1')
      expect(dispatch).toHaveBeenCalledWith('notifications/success', 'UserRemovedGroup', { root: true })
    })

    it('deleteGroup deletes and refreshes list', async () => {
      (GroupsApi.deleteGroup as jest.Mock).mockResolvedValue({})

      await actions.deleteGroup({ dispatch, commit }, 'g1')
      expect(GroupsApi.deleteGroup).toHaveBeenCalledWith('g1')
      expect(dispatch).toHaveBeenCalledWith('getGroups')
    })
  })
})
