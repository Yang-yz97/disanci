import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import service from '@/utils/request'

export const useInboundStore = defineStore('inbound', {
  state: () => ({
    loading: false,
    inboundList: [],
    currentPage: 1,
    pageSize: 10,
    total: 0,
    productOptions: []
  }),
  
  actions: {
    // 获取入库单列表
    async fetchInboundList(params = {}) {
      this.loading = true
      try {
        const response = await service.get('/inbound/list', { params: {
          page: this.currentPage,
          limit: this.pageSize,
          ...params
        }})
        this.inboundList = response.data.list
        this.total = response.data.total
      } catch (error) {
        console.error('获取入库单列表失败:', error)
        ElMessage.error('获取入库单列表失败')
      } finally {
        this.loading = false
      }
    },
    
    // 获取入库单详情
    async fetchInboundDetail(id) {
      try {
        const response = await service.get(`/inbound/${id}`)
        return response.data
      } catch (error) {
        console.error('获取入库单详情失败:', error)
        ElMessage.error('获取入库单详情失败')
        return null
      }
    },
    
    // 创建入库单
    async createInbound(data) {
      try {
        await service.post('/inbound', data)
        ElMessage.success('创建入库单成功')
        return true
      } catch (error) {
        console.error('创建入库单失败:', error)
        ElMessage.error('创建入库单失败')
        return false
      }
    },
    
    // 更新入库单
    async updateInbound(id, data) {
      try {
        await service.put(`/inbound/${id}`, data)
        ElMessage.success('更新入库单成功')
        return true
      } catch (error) {
        console.error('更新入库单失败:', error)
        ElMessage.error('更新入库单失败')
        return false
      }
    },
    
    // 删除入库单
    async deleteInbound(id) {
      try {
        await service.delete(`/inbound/${id}`)
        ElMessage.success('删除入库单成功')
        return true
      } catch (error) {
        console.error('删除入库单失败:', error)
        ElMessage.error('删除入库单失败')
        return false
      }
    },
    
    // 批量删除入库单
    async batchDeleteInbound(ids) {
      try {
        await service.delete('/inbound/batch', { data: { ids } })
        ElMessage.success('批量删除入库单成功')
        return true
      } catch (error) {
        console.error('批量删除入库单失败:', error)
        ElMessage.error('批量删除入库单失败')
        return false
      }
    },
    
    // 导出入库单
    async exportInbound(params) {
      try {
        const response = await service.get('/inbound/export', { params })
        // TODO: 处理导出逻辑
        ElMessage.success('导出成功')
      } catch (error) {
        console.error('导出失败:', error)
        ElMessage.error('导出失败')
      }
    },
    
    // 搜索商品
    async searchProducts(query) {
      try {
        const response = await service.get('/products/list', {
          params: {
            name: query,
            limit: 10
          }
        })
        this.productOptions = response.data.list
      } catch (error) {
        console.error('搜索商品失败:', error)
        ElMessage.error('搜索商品失败')
      }
    }
  }
}) 