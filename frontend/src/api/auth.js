import client from './client'

export const login = (data) => client.post('/auth/login', data).then((res) => res.data)
export const register = (data) => client.post('/auth/register', data).then((res) => res.data)
export const getMe = () => client.get('/auth/me').then((res) => res.data)

