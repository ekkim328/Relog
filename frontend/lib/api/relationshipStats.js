import { apiRequest } from './client'

export const getRelationshipStats = (relationshipId) => apiRequest(`/relationships/${relationshipId}/stats`)
export const getDashboardSummary = () => apiRequest('/dashboard/summary')
export const getRelationshipTimeline = (relationshipId) => apiRequest(`/relationships/${relationshipId}/timeline`)
