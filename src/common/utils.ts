export default {
  getAllowedScopes(scopes: string[], allScopes: string[]) {
    let derivedScopes: string[] = []

    function expandScope(scope: string) {
      return allScopes.filter(s => s.startsWith(scope))
    }

    for (let scope of scopes) {
      derivedScopes.push(...expandScope(scope))
      if (scope.startsWith('admin')) {
        derivedScopes.push(...expandScope(scope.replace('admin', 'delete')))
        derivedScopes.push(...expandScope(scope.replace('admin', 'write')))
        derivedScopes.push(...expandScope(scope.replace('admin', 'read')))
      }
      if (scope.startsWith('write')) {
        derivedScopes.push(...expandScope(scope.replace('write', 'read')))
      }
    }
    return Array.from(new Set(derivedScopes)).sort()
  },
  toHash(obj: object): string {
    return Object.entries(obj)
      .filter(x => !!x[1])
      .reduce((a: string[], [k, v]) => a.concat(`${k}:${v}`), [])
      .join(';')
  },
  fromHash(hash: string): object {
    let h = decodeURI(hash).substring(1)
    return h
      ? h
          .split(';')
          .map(x => x.split(':'))
          .reduce((a, [k, v]) => Object.assign(a, {[k]: v}), {})
      : {}
  }
}
