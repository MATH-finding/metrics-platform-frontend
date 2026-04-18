import axios from 'axios'

const BASE_URL = 'http://localhost:8080/api'

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

export const getDashboard = () => client.get('/dashboard')
export const getDashboardSummary = () => client.get('/dashboard/summary')

export const getConfig = () => client.get('/config')
export const saveConfig = (config) => client.post('/config', config)
export const resetConfig = () => client.post('/config/reset')
export const getDataPath = () => client.get('/config/data-path')

export const calculateUCP = () => client.post('/metrics/ucp')
export const calculateEffort = () => client.post('/metrics/effort')
export const calculateFeaturePoint = () => client.post('/metrics/feature-point')

export const detectSmells = () => client.post('/analysis/smell')
export const getSmellByType = () => client.get('/analysis/smell/count-by-type')
export const getSmellBySeverity = () => client.get('/analysis/smell/count-by-severity')

export const generateReport = (req) => client.post('/report/generate', req)
export const listReports = () => client.get('/report/list')
export const getReportDownloadUrl = (id) => `${BASE_URL}/report/download/${id}`

export const getComparisonData = () => Promise.all([
  client.post('/metrics/ucp'),
  client.post('/metrics/feature-point').catch(() => ({ data: null })),
  client.post('/metrics/effort'),
  client.get('/metrics/fp').catch(() => client.post('/metrics/fp').catch(() => ({ data: null }))),
])
