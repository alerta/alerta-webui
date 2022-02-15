import api from './index'
import axios from 'axios'
import { IIncident } from '@/common/interfaces'

let queryInProgress

export default {
  getIncident: async (incidentId: string) =>
    api.get<IIncident>(`/incidents/${incidentId}`),

  createIncident: async (data: Partial<IIncident>) =>
    api.post<IIncident>(`/incidents`, data),

  updateIncident: async (incidentId: string, data: Partial<IIncident>) =>
    api.put<IIncident>(`/incidents/${incidentId}`, data),

  setStatus: async (incidentId: string, data: object) => {
    return api.put(`/incidents/${incidentId}/status`, data)
  },
  actionIncident: async (incidentId: string, data: object) => {
    return api.put(`/incidents/${incidentId}/action`, data)
  },
  tagIncident: async (incidentId: string, data: object) => {
    return api.put(`/incidents/${incidentId}/tag`, data)
  },
  untagIncident: async (incidentId: string, data: object) => {
    return api.put(`/incidents/${incidentId}/untag`, data)
  },
  updateAttributes: async (incidentId: string, attributes: object) => {
    const data = {
      attributes
    }
    return api.put(`/incidents/${incidentId}/attributes`, data)
  },
  addNote: async (incidentId: string, data: object) => {
    return api.put(`/incidents/${incidentId}/note`, data)
  },
  getNotes: async (incidentId: string) => {
    return api.get(`/incidents/${incidentId}/notes`)
  },
  updateNote: async (incidentId: string, noteId: string, data: object) => {
    return api.put(`/incidents/${incidentId}/note/${noteId}`, data)
  },
  deleteNote: async (incidentId: string, noteId: string) => {
    return api.delete(`/incidents/${incidentId}/note/${noteId}`)
  },
  getIncidents: async (query: object) => {
    if (query && queryInProgress) {
      queryInProgress.cancel(
        'Too many search requests. Cancelling current query.'
      )
    }
    queryInProgress = axios.CancelToken.source()
    const config = {
      params: query,
      cancelToken: queryInProgress.token
    }
    return api.get('/incidents', config)
  },
  getIncidentHistory: async (query: object) => {
    const config = {
      params: query
    }
    return api.get('/incidents/history', config)
  },
  getCounts: async (query: object) => {
    const config = {
      params: query
    }
    return api.get('/incidents/count', config)
  },

  deleteIncident: async (incidentId: string) => {
    return api.delete(`/incidents/${incidentId}`)
  },

  getEnvironments: async (query: object) => {
    const config = {
      params: query
    }
    return api.get('/environments', config)
  },
  getServices: async (query: object) => {
    const config = {
      params: query
    }
    return api.get('/services', config)
  },
  getGroups: async (query: object) => {
    const config = {
      params: query
    }
    return api.get('/incidents/groups', config)
  },
  getTags: async (query: object) => {
    const config = {
      params: query
    }
    return api.get('/incidents/tags', config)
  }
}
