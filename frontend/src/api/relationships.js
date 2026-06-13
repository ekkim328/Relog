import client from './client'

export const getRelationships = () => client.get('/relationships').then((res) => res.data)
export const getRelationship = (id) => client.get(`/relationships/${id}`).then((res) => res.data)
export const createRelationship = (data) => client.post('/relationships', data).then((res) => res.data)
export const updateRelationship = (id, data) => client.patch(`/relationships/${id}`, data).then((res) => res.data)
export const deleteRelationship = (id) => client.delete(`/relationships/${id}`)

