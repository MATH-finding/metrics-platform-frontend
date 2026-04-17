import axios from 'axios'

const BASE_URL = 'http://localhost:8080/api'

// 创建axios实例
const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
})

/**
 * 上传并解析代码文件
 */
export const uploadAndParse = (file) => {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient.post('/parse', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

/**
 * 获取解析结果
 */
export const getParseResult = () => {
    return apiClient.get('/parse/result')
}

/**
 * 获取LOC度量
 */
export const getLOCMetrics = () => {
    return apiClient.get('/metrics/loc')
}

/**
 * 获取圈复杂度
 */
export const getComplexityMetrics = () => {
    return apiClient.get('/metrics/complexity')
}

/**
 * 获取Halstead度量
 */
export const getHalsteadMetrics = () => {
    return apiClient.get('/metrics/halstead')
}

/**
 * 获取度量汇总
 */
export const getMetricsSummary = () => {
    return apiClient.get('/metrics/summary')
}

export default {
    uploadAndParse,
    getParseResult,
    getLOCMetrics,
    getComplexityMetrics,
    getHalsteadMetrics,
    getMetricsSummary
}