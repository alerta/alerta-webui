import api from '.'
import axios, { CancelTokenSource } from 'axios'
import { IIncident } from '@/common/interfaces'

let queryInProgress: CancelTokenSource

export default {
  getIncident: async (incidentId: string) =>
    api.get<IIncident>(`/incidents/${incidentId}`).then((res) => res.data),

  createIncident: async (data: Partial<IIncident>) =>
    api.post<IIncident>(`/incidents`, data).then((res) => res.data),

  updateIncident: async (incidentId: string, data: Partial<IIncident>) =>
    api
      .put<IIncident>(`/incidents/${incidentId}`, data)
      .then((res) => res.data),

  setStatus: async (incidentId: string, data: object) => {
    return api
      .put(`/incidents/${incidentId}/status`, data)
      .then((res) => res.data)
  },
  actionIncident: async (incidentId: string, data: object) => {
    return api
      .put(`/incidents/${incidentId}/action`, data)
      .then((res) => res.data)
  },
  tagIncident: async (incidentId: string, data: object) => {
    return api.put(`/incidents/${incidentId}/tag`, data).then((res) => res.data)
  },
  untagIncident: async (incidentId: string, data: object) => {
    return api
      .put(`/incidents/${incidentId}/untag`, data)
      .then((res) => res.data)
  },
  updateAttributes: async (incidentId: string, attributes: object) =>
    api
      .put(`/incidents/${incidentId}/attributes`, {
        attributes
      })
      .then((res) => res.data),
  addNote: async (incidentId: string, data: object) => {
    return api
      .put(`/incidents/${incidentId}/note`, data)
      .then((res) => res.data)
  },
  getNotes: async (incidentId: string) => {
    return api.get(`/incidents/${incidentId}/notes`).then((res) => res.data)
  },
  updateNote: async (incidentId: string, noteId: string, data: object) => {
    return api
      .put(`/incidents/${incidentId}/note/${noteId}`, data)
      .then((res) => res.data)
  },
  deleteNote: async (incidentId: string, noteId: string) => {
    return api
      .delete(`/incidents/${incidentId}/note/${noteId}`)
      .then((res) => res.data)
  },
  getIncidents: async (query: object) => {
    if (query && queryInProgress)
      queryInProgress.cancel(
        'Too many search requests. Cancelling current query.'
      )

    queryInProgress = axios.CancelToken.source()
    return api
      .get('/incidents', {
        params: query,
        cancelToken: queryInProgress.token
      })
      .then((res) => res.data)
  },
  getIncidentHistory: async (query: object) => {
    const config = {
      params: query
    }
    return api.get('/incidents/history', config).then((res) => res.data)
  },
  getCounts: async (query: object) => {
    const config = {
      params: query
    }
    return api.get('/incidents/count', config).then((res) => res.data)
  },

  deleteIncident: async (incidentId: string) => {
    return api.delete(`/incidents/${incidentId}`).then((res) => res.data)
  },

  getEnvironments: async (query: object) => {
    const config = {
      params: query
    }
    return api.get('/environments', config).then((res) => res.data)
  },
  getServices: async (query: object) => {
    const config = {
      params: query
    }
    return api.get('/services', config).then((res) => res.data)
  },
  getGroups: async (query: object) => {
    const config = {
      params: query
    }
    return api.get('/incidents/groups', config).then((res) => res.data)
  },
  getTags: async (query: object) => {
    const config = {
      params: query
    }
    return api.get('/incidents/tags', config).then((res) => res.data)
  }
}
