/* eslint-disable @typescript-eslint/no-explicit-any */
import { DateRange } from '@/store/interfaces'

export interface INote {
  attributes: any
  createTime: string
  customer: string | null
  href: string
  id: string
  related: {
    alert: string
  }
  text: string
  type: string
  updateTime: string | null
  user: string
}

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
  customer?: string
  previousSeverity: string
  updateTime: number

  alerts: string[] // alert ids

  owner?: IUser
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
  createTime: string
  timeout: number
  rawData: any
  customer: string
  duplicateCount: number
  repeat: boolean
  previousSeverity: string
  receiveTime: string
  lastReceiveId: number
  lastReceiveTime: string
  updateTime: string
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
  owner: string[] | null
}

export interface DTO {
  status: 'ok' | 'error'
  message?: string
  code?: number
  errors?: any[]
  requestId?: string
}
