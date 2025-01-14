import { defineStore } from 'pinia'
import service from '@/utils/request'

export const useAppStore = defineStore('app', {
  state: () => ({
    suppliers: [],
    products: [],
    customers: [],
    lastFetch: {
      suppliers: null,
      products: null,
      customers: null
    }
  }),
  
  actions: {
    async fetchSuppliers() {
      // 如果数据已缓存且未过期（5分钟），直接返回缓存数据
      if (this.suppliers.length > 0 && this.lastFetch.suppliers && 
          Date.now() - this.lastFetch.suppliers < 5 * 60 * 1000) {
        return this.suppliers
      }
      
      try {
        const res = await service.get('/suppliers/list', { 
          params: { page: 1, limit: 1000, status: 'active' }
        })
        if (res?.code === 200 && res?.data?.list) {
          this.suppliers = res.data.list
          this.lastFetch.suppliers = Date.now()
        }
        return this.suppliers
      } catch (error) {
        console.error('获取供应商列表失败:', error)
        return []
      }
    },
    
    async fetchProducts() {
      if (this.products.length > 0 && this.lastFetch.products && 
          Date.now() - this.lastFetch.products < 5 * 60 * 1000) {
        return this.products
      }
      
      try {
        const res = await service.get('/products/list', {
          params: { page: 1, limit: 1000, status: 'active' }
        })
        if (res?.code === 200 && res?.data?.list) {
          this.products = res.data.list
          this.lastFetch.products = Date.now()
        }
        return this.products
      } catch (error) {
        console.error('获取物料列表失败:', error)
        return []
      }
    },
    
    async fetchCustomers() {
      if (this.customers.length > 0 && this.lastFetch.customers && 
          Date.now() - this.lastFetch.customers < 5 * 60 * 1000) {
        return this.customers
      }
      
      try {
        const res = await service.get('/customers/list', {
          params: { page: 1, limit: 1000, status: 'active' }
        })
        if (res?.code === 200 && res?.data?.list) {
          this.customers = res.data.list
          this.lastFetch.customers = Date.now()
        }
        return this.customers
      } catch (error) {
        console.error('获取团队列表失败:', error)
        return []
      }
    },
    
    clearCache() {
      this.suppliers = []
      this.products = []
      this.customers = []
      this.lastFetch = {
        suppliers: null,
        products: null,
        customers: null
      }
    }
  },
  
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'app-cache',
        storage: localStorage,
        paths: ['suppliers', 'products', 'customers', 'lastFetch']
      }
    ]
  }
}) 