<template>
  <div class="home-container">
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <span>欢迎使用仓库管理系统</span>
        </div>
      </template>
      <div class="card-content">
        <h3>快速入口</h3>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card shadow="hover" @click="$router.push('/materials')">
              <el-icon><Box /></el-icon>
              <div class="link-text">物料管理</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" @click="$router.push('/teams')">
              <el-icon><User /></el-icon>
              <div class="link-text">团队管理</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" @click="$router.push('/suppliers')">
              <el-icon><Shop /></el-icon>
              <div class="link-text">供应商管理</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" @click="$router.push('/inventory')">
              <el-icon><Files /></el-icon>
              <div class="link-text">库存查询</div>
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="6">
            <el-card shadow="hover" @click="$router.push('/inbound')">
              <el-icon><Download /></el-icon>
              <div class="link-text">入库管理</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" @click="$router.push('/outbound')">
              <el-icon><Upload /></el-icon>
              <div class="link-text">出库管理</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" @click="$router.push('/bom')">
              <el-icon><Document /></el-icon>
              <div class="link-text">BOM管理</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" @click="$router.push('/special-inbound')">
              <el-icon><Star /></el-icon>
              <div class="link-text">特殊入库</div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <div class="stat-cards">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="stat-card">
            <h3>本月成本统计</h3>
            <div class="stat-details">
              <div class="stat-item">
                <span>入库成本</span>
                <span class="number info">{{ stats.currentMonth.inboundCost?.toLocaleString() }}</span>
              </div>
              <div class="stat-item">
                <span>出库成本</span>
                <span class="number warning">{{ stats.currentMonth.outboundCost?.toLocaleString() }}</span>
              </div>
              <div class="stat-item total">
                <span>合计</span>
                <span class="number">{{ stats.currentMonth.totalCost?.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-card">
            <h3>年度成本统计</h3>
            <div class="stat-details">
              <div class="stat-item">
                <span>入库成本</span>
                <span class="number info">{{ stats.currentYear.inboundCost?.toLocaleString() }}</span>
              </div>
              <div class="stat-item">
                <span>出库成本</span>
                <span class="number warning">{{ stats.currentYear.outboundCost?.toLocaleString() }}</span>
              </div>
              <div class="stat-item total">
                <span>合计</span>
                <span class="number">{{ stats.currentYear.totalCost?.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="stat-card">
            <h3>当前库存统计</h3>
            <div class="stat-details">
              <div class="stat-item">
                <span>库存总额</span>
                <span class="number success">{{ stats.inventory.totalAmount?.toLocaleString() }}</span>
              </div>
              <div class="stat-item">
                <span>物料种类</span>
                <span class="number info">{{ stats.inventory.itemCount }} 种</span>
              </div>
              <div class="stat-item">
                <span>预警物料</span>
                <span class="number warning">{{ stats.inventory.warningCount }} 种</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="charts-section">
      <div class="chart-container">
        <h3>月度成本分析</h3>
        <div ref="chartContainer" class="echarts-container">
          <div v-show="!chartInstance" class="chart-loading">
            图表加载中...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { 
  Box, 
  User, 
  Shop, 
  Files, 
  Download, 
  Upload, 
  Document, 
  Star 
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { storage } from '@/utils/storage'

console.log('Home component loaded')

// 修改统计数据结构
const stats = ref({
  currentMonth: {
    inboundCost: 0,
    outboundCost: 0,
    totalCost: 0
  },
  currentYear: {
    inboundCost: 0,
    outboundCost: 0,
    totalCost: 0
  },
  inventory: {
    totalAmount: 0,
    itemCount: 0,
    warningCount: 0
  }
})

// 修改计算成本函数
function calculateCosts() {
  try {
    const inboundRecords = storage.getStorageData(storage.KEYS.INBOUND_ORDERS) || []
    const outboundRecords = storage.getStorageData(storage.KEYS.OUTBOUND_ORDERS) || []
    const inventory = storage.getStorageData(storage.KEYS.PRODUCTS) || []

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // 计算本月成本
    const monthInbound = inboundRecords.reduce((sum, order) => {
      const orderDate = new Date(order.date)
      if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
        return sum + order.items.reduce((itemSum, item) => 
          itemSum + (Number(item.quantity) * Number(item.price)), 0)
      }
      return sum
    }, 0)

    const monthOutbound = outboundRecords.reduce((sum, order) => {
      const orderDate = new Date(order.date)
      if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
        return sum + order.items.reduce((itemSum, item) => 
          itemSum + (Number(item.quantity) * Number(item.price)), 0)
      }
      return sum
    }, 0)

    // 计算年度成本
    const yearInbound = inboundRecords.reduce((sum, order) => {
      const orderDate = new Date(order.date)
      if (orderDate.getFullYear() === currentYear) {
        return sum + order.items.reduce((itemSum, item) => 
          itemSum + (Number(item.quantity) * Number(item.price)), 0)
      }
      return sum
    }, 0)

    const yearOutbound = outboundRecords.reduce((sum, order) => {
      const orderDate = new Date(order.date)
      if (orderDate.getFullYear() === currentYear) {
        return sum + order.items.reduce((itemSum, item) => 
          itemSum + (Number(item.quantity) * Number(item.price)), 0)
      }
      return sum
    }, 0)

    // 计算库存统计
    const inventoryStats = inventory.reduce((stats, item) => {
      const itemAmount = Number(item.currentStock || 0) * Number(item.price || 0)
      stats.totalAmount += itemAmount
      stats.itemCount += 1
      if (item.currentStock <= item.minStock) {
        stats.warningCount += 1
      }
      return stats
    }, { totalAmount: 0, itemCount: 0, warningCount: 0 })

    return {
      currentMonth: {
        inboundCost: monthInbound,
        outboundCost: monthOutbound,
        totalCost: monthInbound + monthOutbound
      },
      currentYear: {
        inboundCost: yearInbound,
        outboundCost: yearOutbound,
        totalCost: yearInbound + yearOutbound
      },
      inventory: inventoryStats
    }
  } catch (error) {
    console.error('Error calculating costs:', error)
    return {
      currentMonth: { inboundCost: 0, outboundCost: 0, totalCost: 0 },
      currentYear: { inboundCost: 0, outboundCost: 0, totalCost: 0 },
      inventory: { totalAmount: 0, itemCount: 0, warningCount: 0 }
    }
  }
}

// 修改图表数据获取函数
const getChartData = () => {
  try {
    const inboundRecords = storage.getStorageData(storage.KEYS.INBOUND_ORDERS) || []
    const outboundRecords = storage.getStorageData(storage.KEYS.OUTBOUND_ORDERS) || []
    const inventory = storage.getStorageData(storage.KEYS.PRODUCTS) || []

    // 获取最近6个月的数据
    const months = []
    const inboundCosts = []
    const outboundCosts = []
    const inventoryCosts = []

    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const year = date.getFullYear()
      const month = date.getMonth()
      
      months.unshift(`${month + 1}月`)

      // 计算入库成本
      const monthInboundCost = inboundRecords.reduce((sum, order) => {
        const orderDate = new Date(order.date)
        if (orderDate.getMonth() === month && orderDate.getFullYear() === year) {
          return sum + order.items.reduce((itemSum, item) => 
            itemSum + (Number(item.quantity) * Number(item.price)), 0)
        }
        return sum
      }, 0)
      inboundCosts.unshift(monthInboundCost)

      // 计算出库成本
      const monthOutboundCost = outboundRecords.reduce((sum, order) => {
        const orderDate = new Date(order.date)
        if (orderDate.getMonth() === month && orderDate.getFullYear() === year) {
          return sum + order.items.reduce((itemSum, item) => 
            itemSum + (Number(item.quantity) * Number(item.price)), 0)
        }
        return sum
      }, 0)
      outboundCosts.unshift(monthOutboundCost)

      // 计算库存成本（使用当前库存数据，因为历史库存数据不可用）
      const monthInventoryCost = inventory.reduce((sum, item) => 
        sum + (Number(item.currentStock || 0) * Number(item.price || 0)), 0)
      inventoryCosts.unshift(monthInventoryCost)
    }

    return {
      months,
      inboundCosts,
      inventoryCosts,
      outboundCosts
    }
  } catch (error) {
    console.error('Error getting chart data:', error)
    return {
      months: [],
      inboundCosts: [],
      inventoryCosts: [],
      outboundCosts: []
    }
  }
}

// 添加数据更新监听
watch([
  () => storage.getStorageData(storage.KEYS.INBOUND_ORDERS),
  () => storage.getStorageData(storage.KEYS.OUTBOUND_ORDERS),
  () => storage.getStorageData(storage.KEYS.PRODUCTS)
], () => {
  // 更新统计数据
  stats.value = calculateCosts()
  // 更新图表
  updateChart()
}, { deep: true })

// 组件挂载时初始化数据
onMounted(() => {
  try {
    // 初始化数据
    stats.value = calculateCosts()
    
    // 初始化图表
    nextTick(() => {
      initCostChart()
    })

    // 每分钟更新一次数据
    const updateTimer = setInterval(() => {
      stats.value = calculateCosts()
      updateChart()
    }, 60000)

    // 组件卸载时清理定时器
    onBeforeUnmount(() => {
      if (updateTimer) {
        clearInterval(updateTimer)
      }
    })
  } catch (error) {
    console.error('Error in onMounted:', error)
  }
})

// 添加监听器来响应数据变化
watch(stats, (newValue) => {
  console.log('Stats updated:', newValue)
}, { deep: true })

const chartContainer = ref(null)
const chartInstance = ref(null)
const isLoading = ref(true)

// 修改更新图表函数
const updateChart = () => {
  if (!chartInstance.value) {
    console.warn('No chart instance available')
    return
  }

  try {
    const chartData = getChartData()
    
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['入库成本', '库存成本', '出库成本']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: chartData.months
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value} 元'
        }
      },
      series: [
        {
          name: '入库成本',
          type: 'bar',
          stack: 'total',
          emphasis: {
            focus: 'series'
          },
          data: chartData.inboundCosts
        },
        {
          name: '库存成本',
          type: 'bar',
          stack: 'total',
          emphasis: {
            focus: 'series'
          },
          data: chartData.inventoryCosts
        },
        {
          name: '出库成本',
          type: 'bar',
          stack: 'total',
          emphasis: {
            focus: 'series'
          },
          data: chartData.outboundCosts
        }
      ]
    }

    chartInstance.value.setOption(option)
  } catch (error) {
    console.error('Error updating chart:', error)
  }
}

// 修改初始化图表函数
function initCostChart() {
  if (!chartContainer.value) return
  
  try {
    // 销毁已存在的实例
    if (chartInstance.value) {
      chartInstance.value.dispose()
    }

    // 创建新实例
    chartInstance.value = echarts.init(chartContainer.value)
    
    // 设置基础配置
    const baseOption = {
      backgroundColor: '#fff',
      animation: false
    }
    chartInstance.value.setOption(baseOption)
    
    // 更新数据
    updateChart()
    
    // 添加事件监听
    window.addEventListener('resize', handleResize, { passive: true })
  } catch (error) {
    console.error('Error initializing chart:', error)
  }
}

// 处理窗口大小改变
function handleResize() {
  if (chartInstance.value) {
    chartInstance.value.resize()
  }
}
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.welcome-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  padding: 20px 0;
}

.el-card {
  cursor: pointer;
  text-align: center;
  padding: 20px;
}

.el-icon {
  font-size: 24px;
  color: #409EFF;
  margin-bottom: 10px;
}

.link-text {
  color: #303133;
  font-size: 16px;
}

.charts-section {
  margin-top: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.chart-container {
  padding: 20px;
  position: relative;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.chart-container h3 {
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
  color: #303133;
}

#costChart {
  height: 400px;
  border: none;
  position: relative;
  z-index: 1;
}

.chart-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #909399;
  z-index: 2;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 20px;
  border-radius: 4px;
}

.stat-cards {
  margin: 20px 0;
  padding: 10px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: all 0.3s ease;
  height: 120px; /* 固定高度 */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-card h3 {
  color: #606266;
  font-size: 16px;
  margin-bottom: 15px;
}

.stat-card .number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  line-height: 1.5;
}

.stat-card .number::after {
  content: ' 元';
  font-size: 14px;
  color: #909399;
  font-weight: normal;
}

.stat-card .number.warning {
  color: #E6A23C !important;
}

.stat-card .number.success {
  color: #67C23A !important;
}

.stat-card .number.info {
  color: #409EFF !important;
}

.echarts-container {
  width: 100%;
  height: 400px;
  min-width: 300px;
  position: relative;
  background: #fff;
}

.chart-container {
  padding: 20px;
  position: relative;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.chart-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #909399;
  z-index: 2;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 20px;
  border-radius: 4px;
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