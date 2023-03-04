import stateMerge from 'vue-object-merge'

const state = {
  endpoint: 'http://local.alerta.io:8080',
  alarm_model: {}, // includes severity, colors and status maps

  auth_required: true,
  allow_readonly: false,
  readonly_scopes: ['read'],
  provider: 'basic',
  customer_views: false,
  signup_enabled: true,
  email_verification: false,

  client_id: null,
  github_url: 'https://github.com',
  gitlab_url: 'https://gitlab.com',
  keycloak_realm: null,
  keycloak_url: null,
  pingfederate_url: null,

  site_logo_url: '',

  severity: {}, // moved to alarm_model
  colors: {}, // moved to alarm_model
  clipboard_template: '',

  timeouts: {}, // includes alert, heartbeat, ack and shelve timeouts

  blackouts: {}, // include default duration

  dates: {
    longDate: 'ddd D MMM, YYYY HH:mm:ss.SSS Z',
    mediumDate: 'ddd D MMM HH:mm',
    shortTime: 'HH:mm'
  },
  font: {
    'font-family': '"Sintony", Arial, sans-serif',
    'font-size': '13px',
    'font-weight': 500
  },
  audio: {},
  columns: [],
  sort_by: ['severity', 'lastReceiveTime'],
  actions: [],
  filter: {
    text: null,
    environment: null,
    status: null,
    service: null,
    group: null,
    dateRange: [null, null]
  },

  tracking_id: null,
  refresh_interval: 5 * 1000, // milliseconds
  environments: []
}

const mutations = {
  SET_CONFIG(state, config) {
    stateMerge(state, config)
  }
}

const actions = {
  updateConfig({commit}, config) {
    commit('SET_CONFIG', config)
  }
}

const getters = {
  getConfig: state => setting => {
    return state[setting]
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
