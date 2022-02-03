import { I18nOptions } from 'vue-i18n'

export interface IConfig {
  endpoint: string
  base_path?: string

  alarm_model: {
    severity?: any
    colors?: any
    status_maps?: any
  }

  auth_required: boolean
  allow_readonly: boolean
  readonly_scopes: string[]
  provider: string | null
  customer_views?: boolean
  signup_enabled?: boolean
  email_verification?: boolean

  client_id: string | null
  github_url: string | null
  gitlab_url: string | null
  keycloak_realm: string | null
  keycloak_url: string | null
  pingfederate_url: string | null
  oidc_auth_url: string | null
  azure_tenant: string | null
  cognito_domain: string | null
  aws_region: string | null

  site_logo_url: string

  timeouts?: any

  blackouts?: any

  dates?: {
    longDate: string
    mediumDate: string
    shortTime: string
  }
  font?: {
    'font-family': string
    'font-size': string
    'font-weight': number
  }
  audio?: any
  columns?: string[]
  sort_by: (string | null)[]
  actions?: any[]
  filter: {
    text: string | null
    environment: string | null
    status: string | null
    service: string | null
    group: string | null
    dateRange?: (string | null)[]
  }

  tracking_id: string | null
  /* interval in milliseconds */
  refresh_interval?: number
  environments?: any[]
}

export interface IPreferences {
  isDark: boolean
  isMute: boolean
  languagePref: I18nOptions['locale']
  audioURL: './audio/alert_high-intensity.ogg'
  dates: {
    longDate: string | null
    mediumDate: string | null
    shortTime: string | null
  }
  timezone: 'local' | 'utc'
  displayDensity: 'comfortable' | 'compact' | null
  showAllowedEnvs: boolean
  showNotesIcon: boolean
  font: {
    'font-family': string | null
    'font-size': string | null
    'font-weight': string | null
  }
  itemsPerPage: number
  valueWidth: number // px
  textWidth: number // px
  refreshInterval: number // milliseconds
  ackTimeout: null
  shelveTimeout: null
  blackoutStartNow: boolean
  blackoutPeriod: null
  queries: any[]
}
