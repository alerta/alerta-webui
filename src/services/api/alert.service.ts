import axios, { CancelTokenSource } from 'axios'
import api from '.'

let queryInProgress: CancelTokenSource

export default {
  getAlert: (alertId: string) => api.get(`/alert/${alertId}`),
  setStatus: (alertId: string, data: object) =>
    api.put(`/alert/${alertId}/status`, data).then((res) => res.data),
  actionAlert: (alertId: string, data: object) =>
    api.put(`/alert/${alertId}/action`, data).then((res) => res.data),
  tagAlert: (alertId: string, data: object) =>
    api.put(`/alert/${alertId}/tag`, data).then((res) => res.data),
  untagAlert: (alertId: string, data: object) =>
    api.put(`/alert/${alertId}/untag`, data).then((res) => res.data),
  updateAttributes: (alertId: string, attributes: object) =>
    api
      .put(`/alert/${alertId}/attributes`, {
        attributes
      })
      .then((res) => res.data),
  addNote: (alertId: string, data: object) =>
    api.put(`/alert/${alertId}/note`, data).then((res) => res.data),
  getNotes: (alertId: string) => {
    return api.get(`/alert/${alertId}/notes`).then((res) => res.data)
  },
  updateNote: (alertId: string, noteId: string, data: object) => {
    return api
      .put(`/alert/${alertId}/note/${noteId}`, data)
      .then((res) => res.data)
  },
  deleteNote: (alertId: string, noteId: string) => {
    return api
      .delete(`/alert/${alertId}/note/${noteId}`)
      .then((res) => res.data)
  },
  getAlerts: (query: object) => {
    if (query && queryInProgress)
      queryInProgress.cancel(
        'Too many search requests. Cancelling current query.'
      )

    queryInProgress = axios.CancelToken.source()
    return api
      .get('/alerts', {
        params: query,
        cancelToken: queryInProgress.token
      })
      .then((res) => res.data)
  },
  getAlertHistory: (query: object) => {
    return api
      .get('/alerts/history', {
        params: query
      })
      .then((res) => res.data)
  },
  getCounts: (query: object) => {
    return api
      .get('/alerts/count', {
        params: query
      })
      .then((res) => res.data)
  },
  getTop10Count: (query: object) => {
    return api
      .get('/alerts/top10/count', {
        params: query
      })
      .then((res) => res.data)
  },
  getTop10Flapping: (query: object) => {
    return api
      .get('/alerts/top10/flapping', {
        params: query
      })
      .then((res) => res.data)
  },
  getTop10Standing: (query: object) => {
    return api
      .get('/alerts/top10/standing', {
        params: query
      })
      .then((res) => res.data)
  },
  deleteAlert: (alertId: string) => {
    return api.delete(`/alert/${alertId}`).then((res) => res.data)
  },
  getEnvironments: (query: object) => {
    return api
      .get('/environments', {
        params: query
      })
      .then((res) => res.data)
  },
  getServices: (query: object) => {
    return api
      .get('/services', {
        params: query
      })
      .then((res) => res.data)
  },
  getGroups: (query: object) => {
    return api
      .get('/alerts/groups', {
        params: query
      })
      .then((res) => res.data)
  },
  getTags: (query: object) => {
    return api
      .get('/alerts/tags', {
        params: query
      })
      .then((res) => res.data)
  }
}
