// src/api/request.ts
import axios, { AxiosError, AxiosInstance } from 'axios'

// 创建 axios 实例
const request: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// 响应拦截器：统一处理错误 + 直接返回 data
request.interceptors.response.use(
    (response) => response.data,  // 自动解包 .data，业务代码更清爽
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