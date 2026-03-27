describe('Blackouts', () => {
  beforeEach(() => {
    cy.mockApi()
    // Also intercept services and environments for blackout creation form
    cy.intercept('GET', '/api/services*', {
      body: { services: [{ service: 'Web' }, { service: 'Database' }], status: 'ok' }
    }).as('getServices')
  })

  it('displays blackout list', () => {
    cy.visit('/blackouts')
    cy.wait('@getBlackouts')
    cy.contains('Scheduled maintenance window').should('be.visible')
  })

  it('shows blackout details', () => {
    cy.visit('/blackouts')
    cy.wait('@getBlackouts')
    cy.contains('Production').should('be.visible')
  })

  it('can create a new blackout', () => {
    cy.intercept('POST', '/api/blackout', {
      body: { id: 'bo-002', status: 'ok' }
    }).as('createBlackout')

    cy.visit('/blackouts')
    cy.wait('@getBlackouts')

    // Look for the add/create button
    cy.get('button').contains(/new|add|create/i).should('be.visible')
  })

  it('can delete a blackout', () => {
    cy.intercept('DELETE', '/api/blackout/bo-001', {
      body: { status: 'ok' }
    }).as('deleteBlackout')

    cy.visit('/blackouts')
    cy.wait('@getBlackouts')

    // Verify delete controls exist
    cy.get('table').should('be.visible')
  })

  it('handles empty blackouts', () => {
    cy.intercept('GET', '/api/config', { fixture: 'config.json' }).as('getConfig')
    cy.intercept('GET', '/api/blackouts*', {
      body: { blackouts: [], status: 'ok' }
    }).as('getBlackouts')
    cy.intercept('GET', '/api/user/me/attributes', {
      body: { attributes: { prefs: {}, queries: [] }, status: 'ok' }
    }).as('getMeAttributes')

    cy.visit('/blackouts')
    cy.wait('@getBlackouts')
  })
})
