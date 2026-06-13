import { apiRequest } from './client'

export const getRelationshipLogs = (relationshipId, params = {}) => {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null))
  return apiRequest(`/relationships/${relationshipId}/logs${query.size ? `?${query}` : ''}`)
}
export const getLog = (logId) => apiRequest(`/logs/${logId}`)
export const createLog = (relationshipId, data) => apiRequest(`/relationships/${relationshipId}/logs`, { method: 'POST', body: JSON.stringify(data) })
export const updateLog = (logId, data) => apiRequest(`/logs/${logId}`, { method: 'PATCH', body: JSON.stringify(data) })
export const deleteLog = (logId) => apiRequest(`/logs/${logId}`, { method: 'DELETE' })
