import { encrypt, encryptPassword, generateSalt, generateToken } from '@/utils/security'
import { storage } from '@/utils/storage'
import axios from 'axios'

class AuthService {
  // 用户登录
  async login(username, password) {
    try {
      // 生成盐值
      const salt = generateSalt()
      // 加密密码
      const encryptedPassword = encryptPassword(password, salt)
      
      // 发送登录请求
      const response = await axios.post('/api/auth/login', {
        username,
        password: encryptedPassword,
        salt
      })
      
      if (response.data.token) {
        // 存储token和用户信息
        storage.setStorageData('token', response.data.token)
        storage.setStorageData('userInfo', response.data.user)
        return response.data
      }
      
      return null
    } catch (error) {
      console.error('登录失败:', error)
      throw new Error('登录失败，请重试')
    }
  }

  // 用户登出
  logout() {
    storage.removeStorageData('token')
    storage.removeStorageData('userInfo')
    window.location.href = '/login'
  }

  // 获取当前用户信息
  getCurrentUser() {
    return storage.getStorageData('userInfo')
  }

  // 检查用户是否已登录
  isAuthenticated() {
    const token = storage.getStorageData('token')
    return !!token
  }

  // 检查用户是否有权限
  hasPermission(requiredRole) {
    const user = this.getCurrentUser()
    return user?.roles?.includes(requiredRole)
  }

  // 刷新token
  async refreshToken() {
    try {
      const token = storage.getStorageData('token')
      if (!token) return null

      const response = await axios.post('/api/auth/refresh', { token })
      if (response.data.token) {
        storage.setStorageData('token', response.data.token)
        return response.data.token
      }
      return null
    } catch (error) {
      console.error('刷新token失败:', error)
      this.logout()
      throw new Error('会话已过期，请重新登录')
    }
  }
}

export const authService = new AuthService() 