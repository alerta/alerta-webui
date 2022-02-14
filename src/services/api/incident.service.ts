import api from './index'
import axios from 'axios'

let queryInProgress

export default {
  async getIncident(incidentId: string) {
    return api.get(`/incidents/${incidentId}`)
  },
  async setStatus(incidentId: string, data: object) {
    return api.put(`/incidents/${incidentId}/status`, data)
  },
  async actionIncident(incidentId: string, data: object) {
    return api.put(`/incidents/${incidentId}/action`, data)
  },
  async tagIncident(incidentId: string, data: object) {
    return api.put(`/incidents/${incidentId}/tag`, data)
  },
  async untagIncident(incidentId: string, data: object) {
    return api.put(`/incidents/${incidentId}/untag`, data)
  },
  async updateAttributes(incidentId: string, attributes: object) {
    const data = {
      attributes
    }
    return api.put(`/incidents/${incidentId}/attributes`, data)
  },
  async addNote(incidentId: string, data: object) {
    return api.put(`/incidents/${incidentId}/note`, data)
  },
  async getNotes(incidentId: string) {
    return api.get(`/incidents/${incidentId}/notes`)
  },
  async updateNote(incidentId: string, noteId: string, data: object) {
    return api.put(`/incidents/${incidentId}/note/${noteId}`, data)
  },
  async deleteNote(incidentId: string, noteId: string) {
    return api.delete(`/incidents/${incidentId}/note/${noteId}`)
  },
  async getIncidents(query: object) {
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
  async getIncidentHistory(query: object) {
    const config = {
      params: query
    }
    return api.get('/incidents/history', config)
  },
  async getCounts(query: object) {
    const config = {
      params: query
    }
    return api.get('/incidents/count', config)
  },

  async deleteIncident(incidentId: string) {
    return api.delete(`/incidents/${incidentId}`)
  },

  async getEnvironments(query: object) {
    const config = {
      params: query
    }
    return api.get('/environments', config)
  },
  async getServices(query: object) {
    const config = {
      params: query
    }
    return api.get('/services', config)
  },
  async getGroups(query: object) {
    const config = {
      params: query
    }
    return api.get('/incidents/groups', config)
  },
  async getTags(query: object) {
    const config = {
      params: query
    }
    return api.get('/incidents/tags', config)
  }
}
