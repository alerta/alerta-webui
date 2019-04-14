import Vue from 'vue'
import Vuex from 'vuex'
import VueAxios from 'vue-axios'
import { VueAuthenticate } from 'vue-authenticate'
import axios from 'axios'

Vue.use(Vuex)
Vue.use(VueAxios, axios)

export function vueAuth(config) {
  return new VueAuthenticate(Vue.prototype.$http, {
    tokenName: 'token',
    tokenPrefix: '',
    registerUrl: '/auth/signup',
    storageType: 'localStorage',
    storageNamespace: 'auth',
    providers: {
      azure: {
        name: 'Azure Active Directory',
        url: '/auth/azure',
        clientId: config.client_id,
        authorizationEndpoint: `https://login.microsoftonline.com/${config.azure_tenant}/oauth2/authorize`,
        redirectUri: window.location.origin,
        display: 'popup',
        oauthType: '2.0',
        popupOptions: { width: 1020, height: 618 }
      },
      github: {
        name: 'GitHub',
        url: '/auth/github',
        clientId: config.client_id,
        authorizationEndpoint: `${config.github_url}/login/oauth/authorize`,
        scope: ['user:email', 'read:org']
      },
      gitlab: {
        name: 'GitLab',
        url: '/auth/gitlab',
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
        name: 'Google',
        url: '/auth/google',
        clientId: config.client_id
      },
      keycloak: {
        name: 'Keycloak',
        url: '/auth/keycloak',
        clientId: config.client_id,
        authorizationEndpoint: `${config.keycloak_url}/auth/realms/${
          config.keycloak_realm
        }/protocol/openid-connect/auth`,
        redirectUri: window.location.origin,
        oauthType: '2.0'
      },
      openid: {
        name: 'OpenID',
        url: '/auth/openid',
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
        name: 'PingFederate',
        url: '/auth/pingfederate',
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
