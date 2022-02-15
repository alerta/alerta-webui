import { store } from '@/main'
import Vue from 'vue'

// v-has-perms.disable="write:keys"
// v-has-perms="admin:users" (hide is default)

export default Vue.directive('has-perms', (el, binding) => {
  const authRequired = store.getters.getConfig('auth_required')
  const allowReadonly = store.getters.getConfig('allow_readonly')
  const readonlyScopes = store.getters.getConfig('readonly_scopes')
  const authenticated = allowReadonly || store.state.auth.isAuthenticated

  if (!authRequired) return true
  if (!authenticated) return false

  const isInScope = (want: string, have: string): boolean => {
    if (have.includes(want) || have.includes(want.split(':')[0])) return true

    if (want.startsWith('read'))
      return isInScope(want.replace('read', 'write'), have)

    if (want.startsWith('write'))
      return isInScope(want.replace('write', 'admin'), have)

    return false
  }

  const perm = binding.value
  const scopes = authenticated ? store.getters['auth/scopes'] : readonlyScopes
  const action = binding.modifiers.disable ? 'disable' : 'hide'

  if (!perm) return false

  if (!isInScope(perm, scopes))
    action === 'disable'
      ? el.setAttribute('disabled', '')
      : (el.style.display = 'none')
})
