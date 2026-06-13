import { apiRequest } from './client'

export const getRelationships = () => apiRequest('/relationships')
export const getRelationship = (id) => apiRequest(`/relationships/${id}`)
export const createRelationship = (data) => apiRequest('/relationships', { method: 'POST', body: JSON.stringify(data) })
export const updateRelationship = (id, data) => apiRequest(`/relationships/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const deleteRelationship = (id) => apiRequest(`/relationships/${id}`, { method: 'DELETE' })
