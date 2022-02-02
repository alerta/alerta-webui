import api from './index'
import axios from 'axios'

let queryInProgress

export default {
  async getAlert(alertId: string) {
    return api.get(`/alert/${alertId}`)
  },
  async setStatus(alertId: string, data: object) {
    return api.put(`/alert/${alertId}/status`, data)
  },
  async actionAlert(alertId: string, data: object) {
    return api.put(`/alert/${alertId}/action`, data)
  },
  async tagAlert(alertId: string, data: object) {
    return api.put(`/alert/${alertId}/tag`, data)
  },
  async untagAlert(alertId: string, data: object) {
    return api.put(`/alert/${alertId}/untag`, data)
  },
  async updateAttributes(alertId: string, attributes: object) {
    const data = {
      attributes
    }
    return api.put(`/alert/${alertId}/attributes`, data)
  },
  async addNote(alertId: string, data: object) {
    return api.put(`/alert/${alertId}/note`, data)
  },
  async getNotes(alertId: string) {
    return api.get(`/alert/${alertId}/notes`)
  },
  async updateNote(alertId: string, noteId: string, data: object) {
    return api.put(`/alert/${alertId}/note/${noteId}`, data)
  },
  async deleteNote(alertId: string, noteId: string) {
    return api.delete(`/alert/${alertId}/note/${noteId}`)
  },
  async getAlerts(query: object) {
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
    return api.get('/alerts', config)
  },
  async getAlertHistory(query: object) {
    const config = {
      params: query
    }
    return api.get('/alerts/history', config)
  },
  async getCounts(query: object) {
    const config = {
      params: query
    }
    return api.get('/alerts/count', config)
  },
  async getTop10Count(query: object) {
    const config = {
      params: query
    }
    return api.get('/alerts/top10/count', config)
  },
  async getTop10Flapping(query: object) {
    const config = {
      params: query
    }
    return api.get('/alerts/top10/flapping', config)
  },
  async getTop10Standing(query: object) {
    const config = {
      params: query
    }
    return api.get('/alerts/top10/standing', config)
  },

  async deleteAlert(alertId: string) {
    return api.delete(`/alert/${alertId}`)
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
    return api.get('/alerts/groups', config)
  },
  async getTags(query: object) {
    const config = {
      params: query
    }
    return api.get('/alerts/tags', config)
  }
}
