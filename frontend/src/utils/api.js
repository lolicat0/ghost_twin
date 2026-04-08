/**
 * API Utility Functions
 * Centralized API calls for Ghostnet backend
 */

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Text Analysis
export const analyzeText = async (text, userId, metadata = {}) => {
  const response = await api.post('/analyze_text', {
    text,
    user_id: userId,
    metadata
  })
  return response.data
}

// Voice Analysis
export const analyzeVoice = async (audioFile, userId) => {
  const formData = new FormData()
  formData.append('audio', audioFile)
  formData.append('user_id', userId)

  const response = await api.post('/analyze_voice', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

// Face Analysis
export const analyzeFace = async (imageFile, userId) => {
  const formData = new FormData()
  formData.append('image', imageFile)
  formData.append('user_id', userId)

  const response = await api.post('/analyze_face', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

// Get Mood DNA
export const getMoodDNA = async (userId, days = 7) => {
  const response = await api.get(`/get_mood_dna/${userId}`, {
    params: { days }
  })
  return response.data
}

// Predict Future State
export const predictFutureState = async (userId, hoursAhead = 24) => {
  const response = await api.get('/predict_future_state', {
    params: {
      user_id: userId,
      hours_ahead: hoursAhead
    }
  })
  return response.data
}

// Get Recommendations
export const getRecommendations = async (userId) => {
  const response = await api.post('/recommendations', {
    user_id: userId
  })
  return response.data
}

// Fuse Emotions
export const fuseEmotions = async (userId, textEmotion, voiceEmotion, faceEmotion) => {
  const response = await api.post('/fuse_emotions', {
    user_id: userId,
    text_emotion: textEmotion,
    voice_emotion: voiceEmotion,
    face_emotion: faceEmotion
  })
  return response.data
}

export default api









