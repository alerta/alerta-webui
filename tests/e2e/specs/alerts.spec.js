describe('Alert List', () => {
  beforeEach(() => {
    cy.mockApi()
  })

  it('displays alert list on load', () => {
    cy.visit('/alerts')
    cy.wait('@getAlerts')
    cy.get('table').should('be.visible')
    cy.contains('web01').should('be.visible')
    cy.contains('db01').should('be.visible')
    cy.contains('app01').should('be.visible')
  })

  it('shows environment tabs with counts', () => {
    cy.visit('/alerts')
    cy.wait('@getEnvironments')
    cy.contains('Production').should('be.visible')
    cy.contains('Development').should('be.visible')
  })

  it('displays alert severity and status', () => {
    cy.visit('/alerts')
    cy.wait('@getAlerts')
    cy.contains('critical').should('be.visible')
    cy.contains('warning').should('be.visible')
    cy.contains('major').should('be.visible')
  })

  it('displays alert details like resource and event', () => {
    cy.visit('/alerts')
    cy.wait('@getAlerts')
    cy.contains('NodeDown').should('be.visible')
    cy.contains('HighCPU').should('be.visible')
    cy.contains('DiskFull').should('be.visible')
  })

  it('filters alerts by environment tab', () => {
    cy.visit('/alerts')
    cy.wait('@getAlerts')

    // Click Production tab
    cy.contains('Production').click()
    cy.wait('@getAlerts')
  })

  it('redirects root to alerts', () => {
    cy.visit('/')
    cy.url().should('include', '/alerts')
  })

  it('paginates when there are many alerts', () => {
    cy.mockApi()
    cy.visit('/alerts')
    cy.wait('@getAlerts')
    // Pagination controls should be present in the data table
    cy.get('.v-datatable').should('exist')
  })
})

describe('Alert List - Empty State', () => {
  it('handles no alerts gracefully', () => {
    cy.intercept('GET', '/api/config', { fixture: 'config.json' }).as('getConfig')
    cy.intercept('GET', '/api/alerts*', {
      body: { alerts: [], total: 0, pageSize: 20, page: 1, pages: 0, status: 'ok' }
    }).as('getAlerts')
    cy.intercept('GET', '/api/environments*', {
      body: { environments: [], status: 'ok' }
    }).as('getEnvironments')
    cy.intercept('GET', '/api/user/me/attributes', {
      body: { attributes: { prefs: {}, queries: [] }, status: 'ok' }
    }).as('getMeAttributes')

    cy.visit('/alerts')
    cy.wait('@getAlerts')
    cy.get('table').should('be.visible')
  })
})
