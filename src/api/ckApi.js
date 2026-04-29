import axios from 'axios'

const BASE_URL = 'http://localhost:8080/api'

export const fetchCKMetrics = () => {
  return axios.post(`${BASE_URL}/metrics/ck`)
}

export const fetchQualityScore = () => {
  return axios.get(`${BASE_URL}/quality-score`)
}

export const fetchAiSuggestion = (className) => {
  return axios.post(`${BASE_URL}/ai-suggestion`, { className })
}
