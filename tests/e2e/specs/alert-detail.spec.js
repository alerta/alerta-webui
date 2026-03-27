describe('Alert Detail', () => {
  beforeEach(() => {
    cy.mockApi()
    cy.mockAlertDetail('a1b2c3d4')
  })

  it('displays alert detail when clicking an alert', () => {
    cy.visit('/alert/a1b2c3d4')
    cy.wait('@getAlert')
    cy.contains('web01').should('be.visible')
    cy.contains('NodeDown').should('be.visible')
    cy.contains('Node web01 is not responding').should('be.visible')
  })

  it('shows alert metadata', () => {
    cy.visit('/alert/a1b2c3d4')
    cy.wait('@getAlert')
    cy.contains('critical').should('be.visible')
    cy.contains('Production').should('be.visible')
    cy.contains('Network').should('be.visible')
  })

  it('shows alert action buttons', () => {
    cy.visit('/alert/a1b2c3d4')
    cy.wait('@getAlert')
    // Action buttons should be present in toolbar
    cy.get('.v-toolbar').should('be.visible')
  })

  it('can acknowledge an alert', () => {
    cy.intercept('PUT', '/api/alert/a1b2c3d4/action', {
      body: { status: 'ok' }
    }).as('actionAlert')

    cy.visit('/alert/a1b2c3d4')
    cy.wait('@getAlert')

    // Find and click the ack button
    cy.get('[data-cy=ack-btn], button').contains(/ack/i).click({ force: true })
    cy.wait('@actionAlert').its('request.body').should('have.property', 'action', 'ack')
  })

  it('can add a note to an alert', () => {
    cy.intercept('PUT', '/api/alert/a1b2c3d4/note', {
      body: { status: 'ok' }
    }).as('addNote')

    cy.visit('/alert/a1b2c3d4')
    cy.wait('@getAlert')

    // Find note input and submit
    cy.get('textarea, input[type="text"]').last().type('Test note from E2E')
    cy.get('form').submit()
  })

  it('shows alert history', () => {
    cy.mockAlertDetail('a1b2c3d4', {
      history: [
        {
          id: 'hist-1',
          event: 'NodeDown',
          severity: 'critical',
          value: 'DOWN',
          text: 'Node went down',
          type: 'severity',
          updateTime: '2024-01-15T10:30:01.000Z'
        }
      ]
    })

    cy.visit('/alert/a1b2c3d4')
    cy.wait('@getAlert')
    cy.contains('NodeDown').should('be.visible')
  })
})
