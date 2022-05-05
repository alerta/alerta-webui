import api from '@/services/api'
import { IConfig } from '@/store/interfaces'
import { VueAuthenticate } from '@alerta/vue-authenticate'
import Vue from 'vue'
import VueAxios from 'vue-axios'
import Vuex from 'vuex'

Vue.use(Vuex)
Vue.use(VueAxios, api)

const getRedirectUri = (path: string) => window.location.origin + (path || '')

export const vueAuth = (config: IConfig) => {
  const basePath = config.base_path || import.meta.env.BASE_URL
  return new VueAuthenticate(Vue.prototype.$http, {
    tokenPath: 'token',
    tokenName: 'token',
    tokenPrefix: '',
    registerUrl: '/auth/signup',
    logoutUrl: '/auth/logout',
    storageType: 'localStorage',
    storageNamespace: 'auth',
    providers: {
      azure: {
        name: 'Azure Active Directory',
        url: '/auth/azure',
        clientId: config.client_id,
        authorizationEndpoint: `https://login.microsoftonline.com/${config.azure_tenant}/oauth2/v2.0/authorize`,
        redirectUri: getRedirectUri(basePath),
        requiredUrlParams: ['scope'],
        optionalUrlParams: ['display', 'state'],
        scope: 'openid+profile+email',
        display: 'popup',
        oauthType: '2.0',
        popupOptions: { width: 1020, height: 618 },
        state: () => encodeURIComponent(Math.random().toString(36).slice(2))
      },
      cognito: {
        name: 'Amazon Cognito',
        url: '/auth/openid',
        clientId: config.client_id,
        authorizationEndpoint: `https://${config.cognito_domain}.auth.${config.aws_region}.amazoncognito.com/login`,
        redirectUri: getRedirectUri(basePath),
        requiredUrlParams: ['scope'],
        optionalUrlParams: ['display', 'state'],
        scope: 'openid+profile+email',
        display: 'popup',
        oauthType: '2.0',
        popupOptions: { width: 1020, height: 618 },
        state: () => encodeURIComponent(Math.random().toString(36).slice(2))
      },
      github: {
        name: 'GitHub',
        url: '/auth/github',
        clientId: config.client_id,
        authorizationEndpoint: `${config.github_url}/login/oauth/authorize`,
        redirectUri: getRedirectUri(basePath),
        scope: ['user:email', 'read:org']
      },
      gitlab: {
        name: 'GitLab',
        url: '/auth/gitlab',
        clientId: config.client_id,
        authorizationEndpoint: `${config.gitlab_url}/oauth/authorize`,
        redirectUri: getRedirectUri(basePath),
        requiredUrlParams: ['scope'],
        optionalUrlParams: ['display', 'state'],
        scope: ['openid'],
        display: 'popup',
        oauthType: '2.0',
        popupOptions: { width: 1020, height: 618 },
        state: () => encodeURIComponent(Math.random().toString(36).slice(2))
      },
      google: {
        name: 'Google',
        url: '/auth/google',
        clientId: config.client_id,
        redirectUri: getRedirectUri(basePath)
      },
      keycloak: {
        name: 'Keycloak',
        url: '/auth/keycloak',
        clientId: config.client_id,
        authorizationEndpoint: `${config.keycloak_url}/realms/${config.keycloak_realm}/protocol/openid-connect/auth`,
        redirectUri: getRedirectUri(basePath),
        requiredUrlParams: ['scope'],
        optionalUrlParams: ['display', 'state'],
        scope: 'openid+profile+email',
        display: 'popup',
        oauthType: '2.0',
        popupOptions: { width: 1020, height: 618 },
        state: () => encodeURIComponent(Math.random().toString(36).slice(2))
      },
      openid: {
        name: 'OpenID',
        url: '/auth/openid',
        clientId: config.client_id,
        authorizationEndpoint: config.oidc_auth_url,
        redirectUri: getRedirectUri(basePath),
        requiredUrlParams: ['scope'],
        optionalUrlParams: ['display', 'state'],
        scope: 'openid+profile+email',
        display: 'popup',
        oauthType: '2.0',
        popupOptions: { width: 1020, height: 618 },
        state: () => encodeURIComponent(Math.random().toString(36).slice(2))
      },
      pingfederate: {
        name: 'PingFederate',
        url: '/auth/pingfederate',
        clientId: config.client_id,
        authorizationEndpoint: config.pingfederate_url,
        redirectUri: getRedirectUri(basePath || '/'),
        requiredUrlParams: ['pfidpadapterid', 'scope'],
        scope: 'openid+profile+email',
        pfidpadapterid: 'kerberos',
        oauthType: '2.0'
      }
    }
  })
}
