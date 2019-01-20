export default {
  getAllowedScopes(scopes: string[], allScopes: string[]) {
    let derivedScopes: string[] = []

    function expandScope(scope: string) {
      return allScopes.filter(s => s.startsWith(scope))
    }

    for (let scope of scopes) {
      derivedScopes.push(...expandScope(scope))
      if (scope.startsWith('admin')) {
        derivedScopes.push(...expandScope(scope.replace('admin', 'write')))
        derivedScopes.push(...expandScope(scope.replace('admin', 'read')))
      }
      if (scope.startsWith('write')) {
        derivedScopes.push(...expandScope(scope.replace('write', 'read')))
      }
    }
    return Array.from(new Set(derivedScopes)).sort()
  }
}
