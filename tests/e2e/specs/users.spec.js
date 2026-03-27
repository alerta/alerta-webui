describe('Users', () => {
  beforeEach(() => {
    cy.mockApi()
    cy.intercept('GET', '/api/groups*', {
      body: { groups: [{ id: 'g1', name: 'Ops' }], status: 'ok' }
    }).as('getGroups')
    cy.intercept('GET', '/api/permissions*', {
      body: { permissions: [], status: 'ok' }
    }).as('getPerms')
  })

  it('displays user list', () => {
    cy.visit('/users')
    cy.wait('@getUsers')
    cy.contains('Admin User').should('be.visible')
    cy.contains('Regular User').should('be.visible')
  })

  it('shows user email addresses', () => {
    cy.visit('/users')
    cy.wait('@getUsers')
    cy.contains('admin@example.com').should('be.visible')
    cy.contains('user@example.com').should('be.visible')
  })

  it('shows user status', () => {
    cy.visit('/users')
    cy.wait('@getUsers')
    cy.contains('active').should('be.visible')
  })

  it('has create user button', () => {
    cy.visit('/users')
    cy.wait('@getUsers')
    cy.get('button').contains(/new|add|create/i).should('be.visible')
  })

  it('handles empty users', () => {
    cy.intercept('GET', '/api/config', { fixture: 'config.json' }).as('getConfig')
    cy.intercept('GET', '/api/users*', {
      body: { users: [], status: 'ok' }
    }).as('getUsers')
    cy.intercept('GET', '/api/user/me/attributes', {
      body: { attributes: { prefs: {}, queries: [] }, status: 'ok' }
    }).as('getMeAttributes')

    cy.visit('/users')
    cy.wait('@getUsers')
  })
})
