import utils from '@/common/utils'

describe('utils', () => {
  describe('getAllowedScopes', () => {
    const allScopes = [
      'read',
      'read:alerts',
      'read:blackouts',
      'read:heartbeats',
      'read:keys',
      'read:users',
      'read:perms',
      'read:customers',
      'read:webhooks',
      'write',
      'write:alerts',
      'write:blackouts',
      'write:heartbeats',
      'write:keys',
      'write:users',
      'write:perms',
      'write:customers',
      'write:webhooks',
      'admin',
      'admin:alerts',
      'admin:blackouts',
      'admin:heartbeats',
      'admin:keys',
      'admin:users',
      'admin:perms',
      'admin:customers',
      'admin:webhooks',
      'delete',
      'delete:alerts',
      'delete:blackouts',
      'delete:heartbeats',
      'delete:keys',
      'delete:users',
      'delete:perms',
      'delete:customers',
      'delete:webhooks'
    ]

    it('expands read scope to all read sub-scopes', () => {
      const result = utils.getAllowedScopes(['read'], allScopes)
      expect(result).toContain('read')
      expect(result).toContain('read:alerts')
      expect(result).toContain('read:users')
      expect(result).not.toContain('write')
      expect(result).not.toContain('admin')
    })

    it('expands write scope to read + write sub-scopes', () => {
      const result = utils.getAllowedScopes(['write'], allScopes)
      expect(result).toContain('write')
      expect(result).toContain('write:alerts')
      expect(result).toContain('read')
      expect(result).toContain('read:alerts')
      expect(result).not.toContain('admin')
    })

    it('expands admin scope to admin + delete + write + read', () => {
      const result = utils.getAllowedScopes(['admin'], allScopes)
      expect(result).toContain('admin')
      expect(result).toContain('admin:alerts')
      expect(result).toContain('delete')
      expect(result).toContain('delete:alerts')
      expect(result).toContain('write')
      expect(result).toContain('write:alerts')
      expect(result).toContain('read')
      expect(result).toContain('read:alerts')
    })

    it('expands specific admin scope', () => {
      const result = utils.getAllowedScopes(['admin:alerts'], allScopes)
      expect(result).toContain('admin:alerts')
      expect(result).toContain('delete:alerts')
      expect(result).toContain('write:alerts')
      expect(result).toContain('read:alerts')
      expect(result).not.toContain('admin')
      expect(result).not.toContain('read:users')
    })

    it('expands specific write scope to matching read', () => {
      const result = utils.getAllowedScopes(['write:blackouts'], allScopes)
      expect(result).toContain('write:blackouts')
      expect(result).toContain('read:blackouts')
      expect(result).not.toContain('write:alerts')
    })

    it('returns deduplicated sorted results', () => {
      const result = utils.getAllowedScopes(['read', 'write'], allScopes)
      const unique = Array.from(new Set(result))
      expect(result).toEqual(unique)
      expect(result).toEqual([...result].sort())
    })

    it('returns empty for empty input', () => {
      expect(utils.getAllowedScopes([], allScopes)).toEqual([])
    })
  })

  describe('toHash', () => {
    it('converts object to hash string', () => {
      const result = utils.toHash({ environment: 'Production', status: 'open,ack' })
      expect(result).toBe('environment:Production;status:open,ack')
    })

    it('filters out falsy values', () => {
      const result = utils.toHash({ environment: 'Production', text: null, status: undefined })
      expect(result).toBe('environment:Production')
    })

    it('returns empty string for all-falsy object', () => {
      const result = utils.toHash({ text: null, environment: null })
      expect(result).toBe('')
    })

    it('handles empty object', () => {
      expect(utils.toHash({})).toBe('')
    })
  })

  describe('fromHash', () => {
    it('parses hash string into object', () => {
      const result = utils.fromHash('#environment:Production;status:open,ack')
      expect(result).toEqual({ environment: 'Production', status: 'open,ack' })
    })

    it('returns empty object for empty hash', () => {
      expect(utils.fromHash('#')).toEqual({})
      expect(utils.fromHash('')).toEqual({})
    })

    it('handles single key-value pair', () => {
      expect(utils.fromHash('#env:Dev')).toEqual({ env: 'Dev' })
    })
  })
})
