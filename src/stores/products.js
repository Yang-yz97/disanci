import { defineStore } from 'pinia'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

export const useProductStore = defineStore('products', {
  state: () => ({
    loading: false,
    productList: [],
    currentPage: 1,
    pageSize: 10,
    total: 0,
    searchResults: []
  }),

  actions: {
    async fetchProductList(params) {
      this.loading = true
      try {
        const res = await request.get('/products/list', { params })
        console.log('获取商品列表响应:', res)
        
        if (res && Array.isArray(res.list)) {
          this.productList = res.list
          this.total = res.total || 0
          return {
            list: res.list,
            total: res.total,
            page: res.page,
            limit: res.limit
          }
        } else {
          console.warn('商品列表数据格式不正确:', res)
          return {
            list: [],
            total: 0,
            page: 1,
            limit: 10
          }
        }
      } catch (error) {
        console.error('获取商品列表失败:', error)
        ElMessage.error('获取商品列表失败，请检查后端服务是否正常')
        return {
          list: [],
          total: 0,
          page: 1,
          limit: 10
        }
      } finally {
        this.loading = false
      }
    },

    async createProduct(data) {
      try {
        const res = await request.post('/products', data)
        ElMessage.success('创建商品成功')
        return res
      } catch (error) {
        console.error('创建商品失败:', error)
        throw error
      }
    },

    async updateProduct(id, data) {
      try {
        const res = await request.put(`/products/${id}`, data)
        ElMessage.success('更新商品成功')
        return res
      } catch (error) {
        console.error('更新商品失败:', error)
        throw error
      }
    },

    async deleteProduct(id) {
      try {
        const res = await request.delete(`/products/${id}`)
        ElMessage.success('删除商品成功')
        return res
      } catch (error) {
        console.error('删除商品失败:', error)
        throw error
      }
    },

    async batchDeleteProducts(ids) {
      try {
        const res = await request.delete('/products/batch', { data: { ids } })
        ElMessage.success('批量删除商品成功')
        return res
      } catch (error) {
        console.error('批量删除商品失败:', error)
        throw error
      }
    },

    async searchProducts(query) {
      try {
        const res = await request.get('/products/search', { params: { query } })
        return res?.list || []
      } catch (error) {
        console.error('搜索商品失败:', error)
        ElMessage.error('搜索商品失败')
        return []
      }
    }
  }
}) 