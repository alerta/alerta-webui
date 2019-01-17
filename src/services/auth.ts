import Vue from 'vue'
import Vuex from 'vuex'
import VueAxios from 'vue-axios'
import { VueAuthenticate } from 'vue-authenticate'
import axios from 'axios'

Vue.use(Vuex)
Vue.use(VueAxios, axios)

export function vueAuth(config) {
  return new VueAuthenticate(Vue.prototype.$http, {
    baseUrl: config.endpoint,
    tokenName: 'token',
    tokenPrefix: '',
    storageType: 'localStorage',
    storageNamespace: 'auth',
    registerUrl: '/auth/signup',
    providers: {
      github: {
        url: `${config.endpoint}/auth/github`,
        clientId: config.client_id,
        authorizationEndpoint: `${config.github_url}/login/oauth/authorize`,
        scope: ['user:email', 'read:org']
      },
      gitlab: {
        url: `${config.endpoint}/auth/gitlab`,
        clientId: config.client_id,
        authorizationEndpoint: `${config.gitlab_url}/oauth/authorize`,
        redirectUri: window.location.origin,
        requiredUrlParams: ['scope'],
        scope: ['openid'],
        oauthType: '2.0'
      },
      google: {
        url: `${config.endpoint}/auth/google`,
        clientId: config.client_id
      },
      keycloak: {
        url: `${config.endpoint}/auth/keycloak`,
        clientId: config.client_id,
        authorizationEndpoint: `${config.keycloak_url}/auth/realms/${
          config.keycloak_realm
        }/protocol/openid-connect/auth`,
        redirectUri: window.location.origin,
        oauthType: '2.0'
      },
      pingfederate: {
        url: `${config.endpoint}/auth/pingfederate`,
        clientId: config.client_id,
        authorizationEndpoint: config.pingfederate_url,
        redirectUri: window.location.origin + '/',
        requiredUrlParams: ['pfidpadapterid', 'scope'],
        scope: 'openid+profile+email',
        pfidpadapterid: 'kerberos',
        oauthType: '2.0'
      }
    }
  })
}
