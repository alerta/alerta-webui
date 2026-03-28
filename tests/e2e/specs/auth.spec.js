describe('Authentication', () => {
  describe('with auth disabled', () => {
    beforeEach(() => {
      cy.mockApi()
    })

    it('allows access to alerts without login', () => {
      cy.visit('/alerts')
      cy.wait('@getAlerts')
      cy.get('table').should('be.visible')
    })

    it('allows access to heartbeats without login', () => {
      cy.visit('/heartbeats')
      cy.wait('@getHeartbeats')
    })

    it('allows access to blackouts without login', () => {
      cy.visit('/blackouts')
      cy.wait('@getBlackouts')
    })
  })

  describe('with auth required', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/config', {
        body: {
          auth_required: true,
          allow_readonly: false,
          provider: 'basic',
          signup_enabled: true,
          email_verification: false,
          colors: {},
          severity: {},
          dates: { longDate: 'ddd D MMM, YYYY HH:mm:ss.SSS Z', mediumDate: 'ddd D MMM HH:mm', shortTime: 'HH:mm' },
          alarm_model: {},
          timeouts: {},
          actions: [],
          filter: { text: null, environment: null, status: ['open', 'ack'], customer: null, service: null, group: null, dateRange: [null, null] },
          sort_by: ['severity', 'lastReceiveTime'],
          columns: [],
          environments: []
        }
      }).as('getConfig')
    })

    it('redirects to login when accessing protected route', () => {
      cy.visit('/alerts')
      cy.url().should('include', '/login')
    })

    it('shows login form', () => {
      cy.visit('/login')
      cy.get('input').should('exist')
    })

    it('preserves redirect path after login redirect', () => {
      cy.visit('/heartbeats')
      cy.url().should('include', '/login')
      cy.url().should('include', 'redirect=%2Fheartbeats')
    })

    it('login page is accessible', () => {
      cy.visit('/login')
      cy.url().should('include', '/login')
    })
  })

  describe('signup', () => {
    it('signup page is accessible when enabled', () => {
      cy.intercept('GET', '/api/config', {
        body: {
          auth_required: true,
          allow_readonly: false,
          provider: 'basic',
          signup_enabled: true,
          email_verification: false,
          colors: {},
          severity: {},
          dates: { longDate: '', mediumDate: '', shortTime: '' },
          alarm_model: {},
          timeouts: {},
          actions: [],
          filter: { text: null, environment: null, status: null, customer: null, service: null, group: null, dateRange: [null, null] },
          sort_by: ['severity', 'lastReceiveTime'],
          columns: [],
          environments: []
        }
      }).as('getConfig')

      cy.visit('/signup')
      cy.url().should('include', '/signup')
    })
  })
})
