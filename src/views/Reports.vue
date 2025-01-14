<template>
  <div class="reports-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="statistics-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>本月入库总额</span>
              <el-tag type="success">月度</el-tag>
            </div>
          </template>
          <div class="card-body">
            <div class="amount">¥{{ statistics.monthlyInbound.toLocaleString() }}</div>
            <div class="trend">
              较上月
              <span :class="statistics.inboundTrend >= 0 ? 'up' : 'down'">
                {{ Math.abs(statistics.inboundTrend) }}%
                <el-icon><component :is="statistics.inboundTrend >= 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>本月出库总额</span>
              <el-tag type="danger">月度</el-tag>
            </div>
          </template>
          <div class="card-body">
            <div class="amount">¥{{ statistics.monthlyOutbound.toLocaleString() }}</div>
            <div class="trend">
              较上月
              <span :class="statistics.outboundTrend >= 0 ? 'up' : 'down'">
                {{ Math.abs(statistics.outboundTrend) }}%
                <el-icon><component :is="statistics.outboundTrend >= 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>库存总额</span>
              <el-tag type="warning">实时</el-tag>
            </div>
          </template>
          <div class="card-body">
            <div class="amount">¥{{ statistics.totalInventory.toLocaleString() }}</div>
            <div class="trend">
              较上月
              <span :class="statistics.inventoryTrend >= 0 ? 'up' : 'down'">
                {{ Math.abs(statistics.inventoryTrend) }}%
                <el-icon><component :is="statistics.inventoryTrend >= 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>商品周转率</span>
              <el-tag type="info">月度</el-tag>
            </div>
          </template>
          <div class="card-body">
            <div class="amount">{{ statistics.turnoverRate }}次/月</div>
            <div class="trend">
              较上月
              <span :class="statistics.turnoverTrend >= 0 ? 'up' : 'down'">
                {{ Math.abs(statistics.turnoverTrend) }}%
                <el-icon><component :is="statistics.turnoverTrend >= 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>出入库金额趋势</span>
              <el-radio-group v-model="timeRange" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">本年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>库存分类占比</span>
            </div>
          </template>
          <div ref="pieChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 排行榜 -->
    <el-row :gutter="20" class="ranking-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>出库商品排行</span>
              <el-select v-model="outboundRankType" size="small">
                <el-option label="按金额" value="amount" />
                <el-option label="按数量" value="quantity" />
              </el-select>
            </div>
          </template>
          <el-table :data="outboundRanking" stripe>
            <el-table-column type="index" label="排名" width="80" />
            <el-table-column prop="name" label="商品名称" />
            <el-table-column prop="value" label="数值" width="150">
              <template #default="{ row }">
                {{ outboundRankType === 'amount' ? `¥${row.value.toLocaleString()}` : row.value }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>入库商品排行</span>
              <el-select v-model="inboundRankType" size="small">
                <el-option label="按金额" value="amount" />
                <el-option label="按数量" value="quantity" />
              </el-select>
            </div>
          </template>
          <el-table :data="inboundRanking" stripe>
            <el-table-column type="index" label="排名" width="80" />
            <el-table-column prop="name" label="商品名称" />
            <el-table-column prop="value" label="数值" width="150">
              <template #default="{ row }">
                {{ inboundRankType === 'amount' ? `¥${row.value.toLocaleString()}` : row.value }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'

// 统计数据
const statistics = ref({
  monthlyInbound: 128500,
  inboundTrend: 12.5,
  monthlyOutbound: 98600,
  outboundTrend: -8.3,
  totalInventory: 568000,
  inventoryTrend: 5.2,
  turnoverRate: 2.8,
  turnoverTrend: 15.6
})

// 图表相关
const timeRange = ref('month')
const trendChartRef = ref(null)
const pieChartRef = ref(null)
let trendChart = null
let pieChart = null

// 排行榜相关
const outboundRankType = ref('amount')
const inboundRankType = ref('amount')
const outboundRanking = ref([
  { name: '商品A', value: 25600 },
  { name: '商品B', value: 21300 },
  { name: '商品C', value: 18900 },
  { name: '商品D', value: 15600 },
  { name: '商品E', value: 12800 }
])
const inboundRanking = ref([
  { name: '商品F', value: 32100 },
  { name: '商品G', value: 28500 },
  { name: '商品H', value: 23600 },
  { name: '商品I', value: 19800 },
  { name: '商品J', value: 16500 }
])

// 初始化趋势图
const initTrendChart = () => {
  if (!trendChartRef.value) return
  
  trendChart = echarts.init(trendChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['入库金额', '出库金额']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '入库金额',
        type: 'line',
        data: [12000, 13200, 10100, 13400, 9000, 23000, 21000],
        smooth: true,
        areaStyle: {
          opacity: 0.3
        }
      },
      {
        name: '出库金额',
        type: 'line',
        data: [22000, 18200, 19100, 23400, 29000, 33000, 31000],
        smooth: true,
        areaStyle: {
          opacity: 0.3
        }
      }
    ]
  }
  trendChart.setOption(option)
}

// 初始化饼图
const initPieChart = () => {
  if (!pieChartRef.value) return
  
  pieChart = echarts.init(pieChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [
      {
        name: '库存分类',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: 335000, name: '电子产品' },
          { value: 234000, name: '服装' },
          { value: 158000, name: '食品' },
          { value: 135000, name: '图书' },
          { value: 120000, name: '其他' }
        ]
      }
    ]
  }
  pieChart.setOption(option)
}

// 监听窗口大小变化
const handleResize = () => {
  trendChart?.resize()
  pieChart?.resize()
}

onMounted(() => {
  initTrendChart()
  initPieChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  pieChart?.dispose()
})
</script>

<style scoped>
.reports-container {
  padding: 20px;
}

.statistics-cards {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-body {
  text-align: center;
}

.amount {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
}

.trend {
  font-size: 14px;
  color: #909399;
}

.up {
  color: #67c23a;
}

.down {
  color: #f56c6c;
}

.chart-row {
  margin-bottom: 20px;
}

.chart {
  height: 350px;
}

.ranking-row {
  margin-bottom: 20px;
}

:deep(.el-card) {
  margin-bottom: 20px;
  transition: all 0.3s;
}

:deep(.el-card:hover) {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}
</style> 