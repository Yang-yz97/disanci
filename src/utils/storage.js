/**
 * 本地存储工具类
 */

// 定义存储键名
const STORAGE_KEYS = {
  PRODUCTS: 'products',
  MATERIALS: 'materials',
  INBOUND_ORDERS: 'inbound_orders',
  OUTBOUND_ORDERS: 'outbound_orders',
  TEAMS: 'teams',
  SUPPLIERS: 'suppliers'
}

// 存储工具类
class Storage {
  constructor() {
    this.KEYS = STORAGE_KEYS
  }

  // 存储数据
  setStorageData(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Error saving to storage:', error)
      return false
    }
  }

  // 获取数据
  getStorageData(key) {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error reading from storage:', error)
      return null
    }
  }

  // 删除数据
  removeStorageData(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Error removing from storage:', error)
      return false
    }
  }

  // 清空所有数据
  clearStorage() {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Error clearing storage:', error)
      return false
    }
  }
}

// 创建单例实例
const storageInstance = new Storage()

// 同时支持默认导出和命名导出
export default storageInstance
export const storage = storageInstance
export const KEYS = STORAGE_KEYS 