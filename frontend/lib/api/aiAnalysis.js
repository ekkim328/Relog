import { apiRequest } from './client'

export const requestAiAnalysis = (relationshipId) => apiRequest(`/relationships/${relationshipId}/ai-analysis`, { method: 'POST' })
export const getAiReports = (relationshipId) => apiRequest(`/relationships/${relationshipId}/ai-reports`)
export const getAiReport = (reportId) => apiRequest(`/ai-reports/${reportId}`)
