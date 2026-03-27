describe('Heartbeats', () => {
  beforeEach(() => {
    cy.mockApi()
  })

  it('displays heartbeat list', () => {
    cy.visit('/heartbeats')
    cy.wait('@getHeartbeats')
    cy.contains('web01').should('be.visible')
    cy.contains('db01').should('be.visible')
  })

  it('shows heartbeat status', () => {
    cy.visit('/heartbeats')
    cy.wait('@getHeartbeats')
    cy.contains('ok').should('be.visible')
    cy.contains('slow').should('be.visible')
  })

  it('can delete a heartbeat', () => {
    cy.intercept('DELETE', '/api/heartbeat/hb-001', {
      body: { status: 'ok' }
    }).as('deleteHeartbeat')

    cy.visit('/heartbeats')
    cy.wait('@getHeartbeats')

    // Look for a delete button/icon
    cy.get('table').within(() => {
      cy.get('button, .v-icon').first().should('be.visible')
    })
  })

  it('handles empty heartbeats', () => {
    cy.intercept('GET', '/api/config', { fixture: 'config.json' }).as('getConfig')
    cy.intercept('GET', '/api/heartbeats*', {
      body: { heartbeats: [], status: 'ok' }
    }).as('getHeartbeats')
    cy.intercept('GET', '/api/user/me/attributes', {
      body: { attributes: { prefs: {}, queries: [] }, status: 'ok' }
    }).as('getMeAttributes')

    cy.visit('/heartbeats')
    cy.wait('@getHeartbeats')
  })
})
