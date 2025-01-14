import { defineStore } from 'pinia'
import { 
  getOutboundList, 
  getOutboundDetail,
  createOutbound,
  updateOutbound,
  deleteOutbound,
  batchDeleteOutbound,
  exportOutbound,
  searchProducts
} from '@/api/outbound'
import { ElMessage } from 'element-plus'

export const useOutboundStore = defineStore('outbound', {
  state: () => ({
    loading: false,
    outboundList: [],
    currentPage: 1,
    pageSize: 10,
    total: 0,
    productOptions: []
  }),
  
  actions: {
    // 获取出库单列表
    async fetchOutboundList(params = {}) {
      this.loading = true
      try {
        const { list, total } = await getOutboundList({
          page: this.currentPage,
          limit: this.pageSize,
          ...params
        })
        this.outboundList = list
        this.total = total
      } catch (error) {
        console.error('获取出库单列表失败:', error)
        ElMessage.error('获取出库单列表失败')
      } finally {
        this.loading = false
      }
    },
    
    // 获取出库单详情
    async fetchOutboundDetail(id) {
      try {
        return await getOutboundDetail(id)
      } catch (error) {
        console.error('获取出库单详情失败:', error)
        ElMessage.error('获取出库单详情失败')
        return null
      }
    },
    
    // 创建出库单
    async createOutbound(data) {
      try {
        await createOutbound(data)
        ElMessage.success('创建出库单成功')
        return true
      } catch (error) {
        console.error('创建出库单失败:', error)
        ElMessage.error('创建出库单失败')
        return false
      }
    },
    
    // 更新出库单
    async updateOutbound(id, data) {
      try {
        await updateOutbound(id, data)
        ElMessage.success('更新出库单成功')
        return true
      } catch (error) {
        console.error('更新出库单失败:', error)
        ElMessage.error('更新出库单失败')
        return false
      }
    },
    
    // 删除出库单
    async deleteOutbound(id) {
      try {
        await deleteOutbound(id)
        ElMessage.success('删除出库单成功')
        return true
      } catch (error) {
        console.error('删除出库单失败:', error)
        ElMessage.error('删除出库单失败')
        return false
      }
    },
    
    // 批量删除出库单
    async batchDeleteOutbound(ids) {
      try {
        await batchDeleteOutbound(ids)
        ElMessage.success('批量删除出库单成功')
        return true
      } catch (error) {
        console.error('批量删除出库单失败:', error)
        ElMessage.error('批量删除出库单失败')
        return false
      }
    },
    
    // 导出出库单
    async exportOutbound(params) {
      try {
        const blob = await exportOutbound(params)
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = '出库单.xlsx'
        link.click()
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('导出出库单失败:', error)
        ElMessage.error('导出出库单失败')
      }
    },
    
    // 搜索商品
    async searchProducts(query) {
      try {
        const data = await searchProducts(query)
        this.productOptions = data
        return data
      } catch (error) {
        console.error('搜索商品失败:', error)
        ElMessage.error('搜索商品失败')
        return []
      }
    }
  },
  
  persist: {
    key: 'outbound-store',
    paths: ['currentPage', 'pageSize']
  }
}) 