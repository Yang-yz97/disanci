<template>
  <div class="inventory">
    <!-- 搜索和操作栏 -->
    <div class="search-bar mb-20">
      <el-form :inline="true" :model="searchForm" class="form-inline">
        <el-form-item label="物料编号">
          <el-input v-model="searchForm.code" placeholder="请输入物料编号" clearable />
        </el-form-item>
        <el-form-item label="物料名称">
          <el-input v-model="searchForm.name" placeholder="请输入物料名称" clearable />
        </el-form-item>
        <el-form-item label="物料分类">
          <el-select v-model="searchForm.category" placeholder="请选择分类" clearable>
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
      <div class="operation-group">
        <el-button type="primary" @click="handleShowTeamSummary">
          <el-icon><DataAnalysis /></el-icon>团队领料汇总
        </el-button>
        <el-button type="warning" @click="handleExport">
          <el-icon><Download /></el-icon>导出
        </el-button>
      </div>
    </div>

    <!-- 库存列表 -->
    <el-table
      v-loading="loading"
      :data="inventoryList"
      style="width: 100%"
    >
      <el-table-column prop="code" label="物料编号" width="150" />
      <el-table-column prop="name" label="物料名称" width="200" />
      <el-table-column prop="category" label="分类" width="120" />
      <el-table-column prop="unit" label="单位" width="100" />
      <el-table-column label="当前库存" width="120">
        <template #default="{ row }">
          {{ calculateCurrentStock(row) }}
        </template>
      </el-table-column>
      <el-table-column label="BOM需求量" width="120">
        <template #default="{ row }">
          {{ getBOMTotalQuantity(row) }}
        </template>
      </el-table-column>
      <el-table-column label="已入库量" width="120">
        <template #default="{ row }">
          {{ getInboundTotalQuantity(row) }}
        </template>
      </el-table-column>
      <el-table-column label="剩余应采购量" width="120">
        <template #default="{ row }">
          {{ getRemainingPurchaseQuantity(row) }}
        </template>
      </el-table-column>
      <el-table-column label="库存金额" width="120">
        <template #default="{ row }">
          ¥{{ row.stockAmount?.toLocaleString() || '0.00' }}
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
      <el-table-column prop="updateTime" label="更新时间" width="180">
        <template #default="{ row }">
          {{ new Date(row.updateTime).toLocaleString() }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 团队领料汇总对话框 -->
    <el-dialog
      v-model="teamSummaryVisible"
      title="团队领料汇总"
      width="800px"
    >
      <div class="team-summary">
        <!-- 日期筛选 -->
        <el-form :inline="true" :model="summaryForm" class="form-inline mb-20">
          <el-form-item label="统计日期">
            <el-date-picker
              v-model="summaryForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              @change="handleDateRangeChange"
            />
          </el-form-item>
        </el-form>

        <!-- 汇总数据表格 -->
        <el-table
          :data="teamSummaryData"
          style="width: 100%"
          border
        >
          <el-table-column prop="team" label="团队" width="150" />
          <el-table-column label="领料明细" min-width="400">
            <template #default="{ row }">
              <el-table :data="row.items" style="width: 100%">
                <el-table-column prop="name" label="物料名称" width="200" />
                <el-table-column prop="spec" label="规格" width="150" />
                <el-table-column prop="quantity" label="领料数量" width="120" />
                <el-table-column prop="unit" label="单位" width="100" />
              </el-table>
            </template>
          </el-table-column>
          <el-table-column prop="totalAmount" label="总金额" width="150">
            <template #default="{ row }">
              ¥{{ row.totalAmount?.toLocaleString() || '0.00' }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 添加统计信息 -->
    <div class="inventory-stats">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <h3>库存总额</h3>
            <div class="number">{{ totalAmount?.toLocaleString() }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <h3>物料种类</h3>
            <div class="number info">{{ totalItems }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <h3>预警物料</h3>
            <div class="number warning">{{ warningItems }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <h3>超储物料</h3>
            <div class="number error">{{ overStockItems }}</div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search,
  Refresh,
  DataAnalysis,
  Download
} from '@element-plus/icons-vue'
import storage from '../utils/storage'

// 搜索表单
const searchForm = reactive({
  code: '',
  name: '',
  category: ''
})

// 分类选项
const categoryOptions = [
  { label: '电子产品', value: '电子产品' },
  { label: '办公家具', value: '办公家具' },
  { label: '办公用品', value: '办公用品' }
]

// 列表数据
const loading = ref(false)
const inventoryList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 团队领料汇总
const teamSummaryVisible = ref(false)
const summaryForm = reactive({
  dateRange: []
})
const teamSummaryData = ref([])

// 添加统计数据
const totalAmount = ref(0)
const totalItems = ref(0)
const warningItems = ref(0)
const overStockItems = ref(0)

// 获取库存列表
const getInventoryList = async () => {
  try {
    loading.value = true
    // 获取产品和物料数据
    const products = storage.getStorageData(storage.KEYS.PRODUCTS) || []
    
    // 计算统计数据
    let amount = 0
    let warning = 0
    let overStock = 0
    
    // 处理产品列表，添加当前库存和金额信息
    let filteredList = products.map(product => {
      // 直接使用产品自身的价格
      const currentStock = calculateCurrentStock(product)
      const stockAmount = currentStock * (Number(product.price) || 0)
      
      amount += stockAmount
      if (currentStock <= product.minStock) warning++
      if (currentStock >= product.maxStock) overStock++
      
      return {
        ...product,
        currentStock,
        stockAmount,
        price: Number(product.price) || 0
      }
    })

    console.log('处理后的库存列表:', filteredList.map(item => ({
      name: item.name,
      currentStock: item.currentStock,
      price: item.price,
      stockAmount: item.stockAmount
    })))
    
    // 应用搜索过滤
    if (searchForm.code) {
      filteredList = filteredList.filter(item => 
        item.code.toLowerCase().includes(searchForm.code.toLowerCase())
      )
    }
    if (searchForm.name) {
      filteredList = filteredList.filter(item => 
        item.name.toLowerCase().includes(searchForm.name.toLowerCase())
      )
    }
    if (searchForm.category) {
      filteredList = filteredList.filter(item => 
        item.category === searchForm.category
      )
    }
    
    // 更新统计数据
    totalAmount.value = amount
    totalItems.value = products.length
    warningItems.value = warning
    overStockItems.value = overStock
    
    // 更新列表数据
    inventoryList.value = filteredList
    total.value = filteredList.length
    
  } catch (error) {
    console.error('获取库存列表失败:', error)
    ElMessage.error('获取库存列表失败')
  } finally {
    loading.value = false
  }
}

// 获取BOM总需求量
const getBOMTotalQuantity = (product) => {
  try {
    const boms = storage.getStorageData('boms') || []
    let total = 0
    
    boms.forEach(bom => {
      const material = bom.materials.find(m => m.productId === product.id)
      if (material) {
        total += material.quantity
      }
    })
    
    return total
  } catch (error) {
    console.error('计算BOM需求量失败:', error)
    return 0
  }
}

// 获取已入库总量
const getInboundTotalQuantity = (product) => {
  try {
    const inbounds = storage.getStorageData('inbound_orders') || []
    let total = 0
    
    inbounds.forEach(inbound => {
      const item = inbound.items.find(i => i.productId === product.id)
      if (item) {
        total += item.quantity
      }
    })
    
    return total
  } catch (error) {
    console.error('计算已入库总量失败:', error)
    return 0
  }
}

// 计算剩余应采购量
const getRemainingPurchaseQuantity = (product) => {
  const bomTotal = getBOMTotalQuantity(product)
  const inboundTotal = getInboundTotalQuantity(product)
  return Math.max(0, bomTotal - inboundTotal)
}

// 处理查询
const handleSearch = () => {
  currentPage.value = 1
  getInventoryList()
}

// 处理重置
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1
  getInventoryList()
}

// 处理分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  getInventoryList()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  getInventoryList()
}

// 处理导出
const handleExport = () => {
  ElMessage.info('导出功能开发中')
}

// 显示团队领料汇总
const handleShowTeamSummary = () => {
  teamSummaryVisible.value = true
  if (summaryForm.dateRange.length === 2) {
    calculateTeamSummary()
  }
}

// 处理日期范围变化
const handleDateRangeChange = () => {
  if (summaryForm.dateRange.length === 2) {
    calculateTeamSummary()
  }
}

// 计算团队领料汇总数据
const calculateTeamSummary = () => {
  try {
    const outbounds = storage.getStorageData('outbound_orders') || []
    const [startDate, endDate] = summaryForm.dateRange
    
    // 筛选日期范围内的出库单
    const filteredOutbounds = outbounds.filter(item => 
      item.date >= startDate && item.date <= endDate
    )
    
    // 按团队分组汇总
    const teamMap = new Map()
    
    filteredOutbounds.forEach(outbound => {
      const team = outbound.customerName
      if (!teamMap.has(team)) {
        teamMap.set(team, {
          team,
          items: [],
          totalAmount: 0
        })
      }
      
      const teamData = teamMap.get(team)
      
      outbound.items.forEach(item => {
        const existingItem = teamData.items.find(i => i.productId === item.productId)
        if (existingItem) {
          existingItem.quantity += item.quantity
          existingItem.amount += item.amount
        } else {
          teamData.items.push({
            ...item,
            name: item.productName
          })
        }
        teamData.totalAmount += item.amount
      })
    })
    
    teamSummaryData.value = Array.from(teamMap.values())
  } catch (error) {
    console.error('计算团队领料汇总失败:', error)
    ElMessage.error('计算团队领料汇总失败')
  }
}

// 计算当前库存
const calculateCurrentStock = (product) => {
  try {
    // 获取入库总量
    const inbounds = storage.getStorageData(storage.KEYS.INBOUND_ORDERS) || []
    let inboundTotal = 0
    inbounds.forEach(inbound => {
      const item = inbound.items.find(i => i.productId === product.id)
      if (item) {
        inboundTotal += Number(item.quantity) || 0
      }
    })

    // 获取出库总量
    const outbounds = storage.getStorageData(storage.KEYS.OUTBOUND_ORDERS) || []
    let outboundTotal = 0
    outbounds.forEach(outbound => {
      const item = outbound.items.find(i => i.productId === product.id)
      if (item) {
        outboundTotal += Number(item.quantity) || 0
      }
    })

    // 返回当前库存（入库总量 - 出库总量）
    return Math.max(0, inboundTotal - outboundTotal)
  } catch (error) {
    console.error('计算当前库存失败:', error)
    return 0
  }
}

// 页面加载时获取数据
onMounted(() => {
  getInventoryList()
})
</script>

<style scoped>
.inventory {
  padding: 20px;
}

.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
}

.operation-group {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.team-summary {
  max-height: 600px;
  overflow-y: auto;
}

.inventory-stats {
  margin-top: 20px;
  padding: 15px;
  background-color: #f0f0f0;
  border-radius: 4px;
}

.stat-card {
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 600;
}

.stat-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
}

.stat-item.total {
  margin-top: 5px;
  padding-top: 10px;
  border-top: 1px dashed #dcdfe6;
}

.stat-item span:first-child {
  color: #606266;
  font-size: 14px;
}

.stat-card {
  height: auto !important;
  padding: 15px !important;
}

.stat-card h3 {
  margin-bottom: 20px !important;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
}
</style> 