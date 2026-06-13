import { apiRequest } from './client'

export const getEmotionTags = () => apiRequest('/emotion-tags')
