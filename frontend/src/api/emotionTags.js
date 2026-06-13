import client from './client'

export const getEmotionTags = () => client.get('/emotion-tags').then((res) => res.data)

