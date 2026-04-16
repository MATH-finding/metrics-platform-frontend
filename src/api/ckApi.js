import axios from 'axios'

const BASE_URL = 'http://localhost:8080'

export const fetchCKMetrics = () => {
  return axios.post(`${BASE_URL}/api/metrics/ck`)
}

export const fetchQualityScore = () => {
  return axios.get(`${BASE_URL}/api/quality-score`)
}