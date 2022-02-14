import { I18nOptions } from 'vue-i18n'
import { DataOptions } from 'vuetify'

export type DateRange = [number | null, number | null]

export interface IStore {
  multiselect: boolean
  refresh: boolean
  auth?: any
  config?: IConfig
}

export interface IFilter {
  text?: string | null
  environment?: string | null
  status?: string[] | null
  service?: string[] | null
  group?: string[] | null
  customer?: string[] | null
  dateRange: DateRange
}

export interface IAlerts {
  isLoading: boolean
  isSearching: boolean

  alerts: any[]
  selected: any[]
  environments: any[]
  services: any[]
  groups: {
    count: number
    environment: string
    group: string
  }[]
  tags: any[]

  alert: any
  notes: any[]

  isWatch: boolean
  isKiosk: boolean
  showPanel: boolean
  displayDensity: 'comfortable' | 'compact'

  query: URLSearchParams
  filter: IFilter

  pagination: DataOptions & {
    itemsPerPageOptions: number[]
    totalItems: number
  }
}

export interface IIncidents extends Omit<IAlerts, 'alerts'> {
  incidents: any[]
}

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
  filter: IFilter

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

export interface IUsers {
  isLoading: boolean
  domains: any[]
  users: any[]
  groups: any[]
}

export interface ICustomers {
  isLoading: boolean
  customers: any[]
}

export interface IReports {
  offenders: []
  flapping: []
  standing: []

  query?: string

  filter: {
    environment: any | null
    severity: any[] | null
    status: string[] | null
    customer: any[] | null
    service: any[] | null
    group: any[] | null
    dateRange: DateRange
  }

  pagination: {
    page: number
    itemsPerPage: number
  }
}

export interface IPerms {
  isLoading: boolean

  permissions: string[]
  scopes: string[]
}

export interface IBlackouts {
  isLoading: boolean

  blackouts: any[]
}
export interface IGroups {
  isLoading: boolean

  groups: any[]
  group: any
  users: any[]
}

export interface Snackbar {
  type: 'success' | 'info' | 'error'
  text: string
  action: string
  timeout: number
}

export interface Banner {
  type: 'success' | 'info' | 'warning' | 'error'
  text: string
  icon: string | null
}

export interface INotifications {
  snackbars: Snackbar[]
  banners: Banner[]
}

export interface IKeys {
  isLoading: boolean
  keys: any[]
  users?: any[]
}

export interface IManagement {
  isLoading?: boolean
  manifest: any

  healthcheck: any
  status: any

  application: any
  metrics: any[]
  time: number | null
  uptime: number | null
  version: string | null
}

export interface IAuth {
  isAuthenticated: boolean
  token: string | null
  payload: any

  isSending: boolean
}

export interface IHeartbeats {
  isLoading: boolean

  heartbeats: any[]
}
