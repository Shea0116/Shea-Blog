// src/api/request.ts
import axios, { AxiosError, AxiosInstance } from 'axios'

// 创建 axios 实例
const request: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE || 'https://soulshea.xyz/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// 响应拦截器：统一处理错误 + 直接返回 data
request.interceptors.response.use(
    (response) => {
        // 处理后端返回的统一包装格式 {code, data, message}
        const data = response.data
        if (data && typeof data === 'object' && 'code' in data && 'data' in data) {
            if (data.code === 200) {
                return data.data
            } else {
                return Promise.reject(new Error(data.message || '请求失败'))
            }
        }
        // 保持原有逻辑，兼容旧格式
        return data
    },
    (error: AxiosError<{ detail?: string }>) => {
        // 统一错误处理
        if (error.response) {
            // 服务器返回了错误状态码
            const detail = error.response.data?.detail || error.message
            console.error(`[API ${error.response.status}]`, detail)
            return Promise.reject(new Error(detail))
        } else if (error.request) {
            // 请求发出了但没响应（网络问题）
            console.error('[API] 网络错误：服务器无响应')
            return Promise.reject(new Error('网络错误，请检查后端服务'))
        } else {
            console.error('[API] 请求配置错误', error.message)
            return Promise.reject(error)
        }
    }
)

export default request