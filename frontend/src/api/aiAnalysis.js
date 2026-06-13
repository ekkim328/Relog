import client from './client'

export const requestAiAnalysis = (relationshipId) => client.post(`/relationships/${relationshipId}/ai-analysis`).then((res) => res.data)
export const getAiReports = (relationshipId) => client.get(`/relationships/${relationshipId}/ai-reports`).then((res) => res.data)
export const getAiReport = (reportId) => client.get(`/ai-reports/${reportId}`).then((res) => res.data)

