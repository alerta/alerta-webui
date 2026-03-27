// Intercept all common API requests with fixture data
Cypress.Commands.add('mockApi', (overrides = {}) => {
  // Config endpoint (no auth required for test config)
  cy.intercept('GET', '/api/config', {
    fixture: overrides.config || 'config.json'
  }).as('getConfig')

  // Alerts
  cy.intercept('GET', '/api/alerts*', {
    fixture: overrides.alerts || 'alerts.json'
  }).as('getAlerts')

  // Environments
  cy.intercept('GET', '/api/environments*', {
    fixture: overrides.environments || 'environments.json'
  }).as('getEnvironments')

  // Services
  cy.intercept('GET', '/api/services*', {
    body: { services: [{ service: 'Web' }, { service: 'Database' }, { service: 'App' }], status: 'ok' }
  }).as('getServices')

  // Alert groups
  cy.intercept('GET', '/api/alerts/groups*', {
    body: { groups: [{ group: 'Network' }, { group: 'Performance' }, { group: 'Storage' }], status: 'ok' }
  }).as('getAlertGroups')

  // Tags
  cy.intercept('GET', '/api/alerts/tags*', {
    body: { tags: [{ tag: 'critical' }, { tag: 'disk' }, { tag: 'storage' }], status: 'ok' }
  }).as('getTags')

  // Heartbeats
  cy.intercept('GET', '/api/heartbeats*', {
    fixture: overrides.heartbeats || 'heartbeats.json'
  }).as('getHeartbeats')

  // Blackouts
  cy.intercept('GET', '/api/blackouts*', {
    fixture: overrides.blackouts || 'blackouts.json'
  }).as('getBlackouts')

  // Users
  cy.intercept('GET', '/api/users*', {
    fixture: overrides.users || 'users.json'
  }).as('getUsers')

  // User attributes (preferences)
  cy.intercept('GET', '/api/user/me/attributes', {
    body: { attributes: { prefs: {}, queries: [] }, status: 'ok' }
  }).as('getMeAttributes')
})

// Intercept a single alert detail request
Cypress.Commands.add('mockAlertDetail', (alertId, alertData) => {
  const defaultAlert = {
    id: alertId || 'a1b2c3d4',
    resource: 'web01',
    event: 'NodeDown',
    environment: 'Production',
    severity: 'critical',
    status: 'open',
    service: ['Web'],
    group: 'Network',
    value: 'DOWN',
    text: 'Node web01 is not responding',
    tags: [],
    attributes: {},
    origin: 'nagios/web01',
    type: 'exceptionAlert',
    createTime: '2024-01-15T10:30:00.000Z',
    receiveTime: '2024-01-15T10:30:01.000Z',
    lastReceiveTime: '2024-01-15T10:30:01.000Z',
    customer: null,
    duplicateCount: 0,
    repeat: false,
    previousSeverity: 'normal',
    trendIndication: 'moreSevere',
    timeout: 86400,
    history: [
      {
        id: 'hist-1',
        event: 'NodeDown',
        severity: 'critical',
        status: null,
        value: 'DOWN',
        text: 'Node web01 is not responding',
        type: 'severity',
        updateTime: '2024-01-15T10:30:01.000Z'
      }
    ]
  }

  cy.intercept('GET', `/api/alert/${alertId || 'a1b2c3d4'}`, {
    body: { alert: { ...defaultAlert, ...alertData }, status: 'ok' }
  }).as('getAlert')

  cy.intercept('GET', `/api/alert/${alertId || 'a1b2c3d4'}/notes`, {
    body: { notes: [], status: 'ok' }
  }).as('getNotes')
})
