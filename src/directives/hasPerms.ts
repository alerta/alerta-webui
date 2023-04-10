import {store} from '@/main' 

// v-has-perms.disable="write:keys"
// v-has-perms="admin:users" (hide is default)

export default function (el, binding) {
  let authRequired = store.getters.getConfig('auth_required')
  let allowReadonly = store.getters.getConfig('allow_readonly')
  let readonlyScopes = store.getters.getConfig('readonly_scopes')
  let authenticated = store.state.auth.isAuthenticated

  if (!authRequired) {
    return true
  }
  if (allowReadonly) {
    authenticated = true
  }
  if (!authenticated) {
    return false
  }

  // helper function
  function isInScope(want, have): Boolean {
    if (have.includes(want) || have.includes(want.split(':')[0])) {
      return true
    } else if (want.startsWith('read')) {
      return isInScope(want.replace('read', 'write'), have)
    } else if (want.startsWith('write')) {
      return isInScope(want.replace('write', 'admin'), have)
    }
    return false
  }

  let perm = binding.value
  let scopes = authenticated ? store.getters['auth/scopes'] : readonlyScopes
  let action = binding.modifiers.disable ? 'disable' : 'hide'

  if (!perm) {
    return false
  }

  if (!isInScope(perm, scopes)) {
    if (action === 'disable') {
      el.setAttribute('disabled', '')
    } else {
      el.style.display = 'none'
    }
  }
}
