import axios from 'axios'
import { ElMessage } from 'element-plus'
import { authService } from '@/services/auth.service'

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 重试配置
const retryConfig = {
  maxRetries: 3, // 最大重试次数
  retryDelay: 1000, // 重试间隔（毫秒）
  retryableStatus: [408, 429, 500, 502, 503, 504] // 可重试的状态码
}

// 防重复请求存储
const pendingRequests = new Set()

// 生成请求Key
const getRequestKey = (config) => {
  const { method, url, params, data } = config
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&')
}

// 添加请求拦截器
request.interceptors.request.use(
  config => {
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() }
    }
    
    // 添加token到请求头
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    // 防重复提交
    const requestKey = getRequestKey(config)
    if (config.method !== 'get') {
      if (pendingRequests.has(requestKey)) {
        return Promise.reject(new Error('请求正在处理中，请勿重复提交'))
      }
      pendingRequests.add(requestKey)
    }
    
    // 添加重试配置
    config.retryCount = 0
    
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 添加响应拦截器
request.interceptors.response.use(
  response => {
    // 清除防重复提交标记
    const requestKey = getRequestKey(response.config)
    pendingRequests.delete(requestKey)
    
    return response.data
  },
  async error => {
    const config = error.config

    // 清除防重复提交标记
    if (config) {
      const requestKey = getRequestKey(config)
      pendingRequests.delete(requestKey)
    }

    // 处理请求重试
    if (config && retryConfig.retryableStatus.includes(error.response?.status)) {
      config.retryCount = config.retryCount || 0
      
      if (config.retryCount < retryConfig.maxRetries) {
        config.retryCount++
        
        // 延迟重试
        await new Promise(resolve => 
          setTimeout(resolve, retryConfig.retryDelay * config.retryCount)
        )
        
        console.log(`重试请求 (${config.retryCount}/${retryConfig.maxRetries}): ${config.url}`)
        return request(config)
      }
    }

    if (error.response) {
      switch (error.response.status) {
        case 401: // 未授权
          // 尝试刷新token
          try {
            const newToken = await authService.refreshToken()
            if (newToken) {
              // 重试原请求
              error.config.headers['Authorization'] = `Bearer ${newToken}`
              return request(error.config)
            }
          } catch (refreshError) {
            authService.logout()
            ElMessage.error('登录已过期，请重新登录')
          }
          break
          
        case 403: // 权限不足
          ElMessage.error('您没有权限执行此操作')
          break
          
        case 404: // 资源不存在
          ElMessage.error('请求的资源不存在')
          break
          
        case 429: // 请求过于频繁
          ElMessage.error('请求过于频繁，请稍后再试')
          break
          
        default:
          if (error.response.status >= 500) {
            ElMessage.error('服务器错误，请稍后再试')
          } else {
            ElMessage.error(error.response.data.message || '请求失败')
          }
      }
    } else if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时，请检查网络连接')
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    
    return Promise.reject(error)
  }
)

export default request 