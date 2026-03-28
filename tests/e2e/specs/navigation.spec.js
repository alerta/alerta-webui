describe('Navigation', () => {
  beforeEach(() => {
    cy.mockApi()
  })

  it('navigates to alerts page', () => {
    cy.visit('/alerts')
    cy.url().should('include', '/alerts')
  })

  it('navigates to heartbeats page', () => {
    cy.visit('/heartbeats')
    cy.url().should('include', '/heartbeats')
  })

  it('navigates to blackouts page', () => {
    cy.visit('/blackouts')
    cy.url().should('include', '/blackouts')
  })

  it('navigates to users page', () => {
    cy.visit('/users')
    cy.url().should('include', '/users')
  })

  it('redirects unknown routes to alerts', () => {
    cy.visit('/nonexistent')
    cy.url().should('include', '/alerts')
  })

  it('redirects root to alerts', () => {
    cy.visit('/')
    cy.url().should('include', '/alerts')
  })

  it('sets page title for alerts', () => {
    cy.visit('/alerts')
    cy.title().should('include', 'Alerts')
  })

  it('sets page title for heartbeats', () => {
    cy.visit('/heartbeats')
    cy.title().should('include', 'Heartbeats')
  })
})
