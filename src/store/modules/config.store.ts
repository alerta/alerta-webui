import stateMerge from 'vue-object-merge'

const state = {
  endpoint: 'http://local.alerta.io:8080',
  alarm_model: {},  // includes severity, colors and status maps

  auth_required: true,
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

  severity: {},  // moved to alarm_model
  colors: {},  // moved to alarm_model

  dates: {
    longDate: 'd/M/YYYY h:mm:ss.SSS A',
    mediumDate: 'ddd d MMM HH:mm',
    shortTime: 'HH:mm'
  },
  audio: {},
  columns: [],
  sort_by: 'lastReceiveTime',
  actions: [],

  tracking_id: null,
  refresh_interval: 5000
}

const mutations = {
  SET_CONFIG(state, config) {
    stateMerge(state, config)
  }
}

const actions = {
  update({ commit }, config) {
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
