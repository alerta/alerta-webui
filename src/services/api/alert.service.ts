import axios, { CancelTokenSource } from 'axios'
import api from '.'

let queryInProgress: CancelTokenSource

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
    return api.put(`/alert/${alertId}/attributes`, {
      attributes
    })
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
    return api.get('/alerts/history', {
      params: query
    })
  },
  async getCounts(query: object) {
    return api.get('/alerts/count', {
      params: query
    })
  },
  async getTop10Count(query: object) {
    return api.get('/alerts/top10/count', {
      params: query
    })
  },
  async getTop10Flapping(query: object) {
    return api.get('/alerts/top10/flapping', {
      params: query
    })
  },
  async getTop10Standing(query: object) {
    return api.get('/alerts/top10/standing', {
      params: query
    })
  },
  async deleteAlert(alertId: string) {
    return api.delete(`/alert/${alertId}`)
  },
  async getEnvironments(query: object) {
    return api.get('/environments', {
      params: query
    })
  },
  async getServices(query: object) {
    return api.get('/services', {
      params: query
    })
  },
  async getGroups(query: object) {
    return api.get('/alerts/groups', {
      params: query
    })
  },
  async getTags(query: object) {
    return api.get('/alerts/tags', {
      params: query
    })
  }
}
