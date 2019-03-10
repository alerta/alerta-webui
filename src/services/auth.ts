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
      azure: {
        name: 'azure',
        url: `${config.endpoint}/auth/azure`,
        clientId: config.client_id,
        authorizationEndpoint: `https://login.microsoftonline.com/${config.azure_tenant}/oauth2/authorize`,
        redirectUri: window.location.origin,
        display: 'popup',
        oauthType: '2.0',
        popupOptions: { width: 1020, height: 618 }
      },
      github: {
        url: `${config.endpoint}/auth/github`,
        clientId: config.client_id,
        authorizationEndpoint: `${config.github_url}/login/oauth/authorize`,
        scope: ['user:email', 'read:org']
      },
      gitlab: {
        name: 'gitlab',
        url: `${config.endpoint}/auth/gitlab`,
        clientId: config.client_id,
        authorizationEndpoint: `${config.gitlab_url}/oauth/authorize`,
        redirectUri: window.location.origin,
        requiredUrlParams: ['scope'],
        scope: ['openid'],
        display: 'popup',
        oauthType: '2.0',
        popupOptions: { width: 1020, height: 618 }
      },
      google: {
        url: `${config.endpoint}/auth/google`,
        clientId: config.client_id
      },
      keycloak: {
        name: 'keycloak',
        url: `${config.endpoint}/auth/keycloak`,
        clientId: config.client_id,
        authorizationEndpoint: `${config.keycloak_url}/auth/realms/${
          config.keycloak_realm
        }/protocol/openid-connect/auth`,
        redirectUri: window.location.origin,
        oauthType: '2.0'
      },
      openid: {
        name: 'openid',
        url: `${config.endpoint}/auth/openid`,
        clientId: config.client_id,
        authorizationEndpoint: config.oidc_auth_url,
        redirectUri: window.location.origin,
        requiredUrlParams: ['scope'],
        optionalUrlParams: ['display', 'state'],
        scope: 'openid+profile+email',
        display: 'popup',
        oauthType: '2.0',
        popupOptions: { width: 1020, height: 618 },
        state: () => encodeURIComponent(Math.random().toString(36).substr(2))
      },
      pingfederate: {
        name: 'pingfederate',
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
