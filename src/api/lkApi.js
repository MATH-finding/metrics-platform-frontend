import axios from 'axios'

const BASE_URL = 'http://localhost:8080'

export const fetchLKMetrics = () => {
    return axios.post(`${BASE_URL}/api/metrics/lk`)
}
export const fetchFPMetrics = () => {
    return axios.get(`${BASE_URL}/api/fp`)
}