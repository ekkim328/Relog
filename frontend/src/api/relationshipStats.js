import client from './client'

export const getRelationshipStats = (relationshipId) => client.get(`/relationships/${relationshipId}/stats`).then((res) => res.data)
export const getDashboardSummary = () => client.get('/dashboard/summary').then((res) => res.data)
export const getRelationshipTimeline = (relationshipId) => client.get(`/relationships/${relationshipId}/timeline`).then((res) => res.data)

