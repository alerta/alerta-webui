import { DateRange } from '@/store/interfaces'

export interface IIncident {
  id: string
  href: string
  title: string
  environment: string
  severity: string
  status: string
  service: string[]
  tags: string[]
  createTime: number
  timeout: number
  customer?: any
  previousSeverity: string
  updateTime: number

  alerts: string[] // alert ids
}

export interface IAlert {
  id: string
  href: string
  resource: string
  event: string
  environment: string
  severity: string
  correlate: string
  status: string
  group: string
  value: string
  text: string
  tags: string[]
  attributes: any
  origin: string
  type: string
  createTime: number
  timeout: number
  rawData: any
  customer: any
  duplicateCount: number
  repeat: boolean
  previousSeverity: string
  receiveTime: number
  lasReceiveId: number
  lasReceiveTime: number
  updateTime: number
  history: any[]
}

export interface IUser {
  id: string
  login: string
  name: string
  status: string
  text: string
  href: string

  email: string
  email_verified: boolean
  domain: string

  roles: string[]

  createTime: string
  updateTime: string
  lastLogin: string

  attributes: {
    prefs: {
      displayDensity: string
      font: {
        'font-size': string
      }
      isDark: boolean
      isMute: boolean
      showAllowedEnvs: boolean
      showNotesIcon: boolean
    }
    queries: any[]
  }
}

export interface IReport {
  count: number
  duplicateCount: number
  environments: string[]
  event: string
  resources: {
    href: string
    id: string
    resource: string
  }[]
  services: string[]
}

export interface IFilter {
  environment: string | null
  severity: any[] | null
  status: string[] | null
  customer: any[] | null
  service: string[] | null
  group: string[] | null
  dateRange: DateRange
  text: string | null
}

export interface DTO {
  status: 'ok' | 'error'
  message?: string
  code?: number
  errors?: any[]
  requestId?: string
}
