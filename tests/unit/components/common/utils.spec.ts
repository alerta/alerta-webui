import utils from '@/common/utils'

describe('Utils', () => {
  let allScopes = [
    'read',
    'write',
    'admin',
    'read:alerts',
    'write:alerts',
    'admin:alerts',
    'read:blackouts',
    'write:blackouts',
    'admin:blackouts',
    'read:heartbeats',
    'write:heartbeats',
    'admin:heartbeats',
    'write:users',
    'admin:users',
    'read:perms',
    'admin:perms',
    'read:customers',
    'admin:customers',
    'read:keys',
    'write:keys',
    'admin:keys',
    'write:webhooks',
    'read:oembed',
    'read:management',
    'admin:management',
    'read:userinfo'
  ]

  it('derives full scopes from assigned scopes', () => {
    let result = utils.getAllowedScopes(['admin:perms', 'read', 'write:keys'], allScopes)
    let expected = [
      'admin:perms',
      'read:perms',
      'read',
      'read:alerts',
      'read:blackouts',
      'read:heartbeats',
      'read:customers',
      'read:oembed',
      'read:management',
      'read:userinfo',
      'write:keys',
      'read:keys'
    ]
    expect(result.sort()).toEqual(expected.sort())
  })
})
