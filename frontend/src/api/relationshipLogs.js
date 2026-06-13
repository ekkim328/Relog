import client from './client'

export const getRelationshipLogs = (relationshipId, params) => client.get(`/relationships/${relationshipId}/logs`, { params }).then((res) => res.data)
export const getLog = (logId) => client.get(`/logs/${logId}`).then((res) => res.data)
export const createLog = (relationshipId, data) => client.post(`/relationships/${relationshipId}/logs`, data).then((res) => res.data)
export const updateLog = (logId, data) => client.patch(`/logs/${logId}`, data).then((res) => res.data)
export const deleteLog = (logId) => client.delete(`/logs/${logId}`)

