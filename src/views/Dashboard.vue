<!-- 仪表盘组件 -->
<template>
  <div class="dashboard">
    <!-- 数据概览卡片 -->
    <el-row :gutter="20" class="mb-20">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>物料总数</span>
            </div>
          </template>
          <div class="card-body">
            <h2>{{ statistics.totalProducts }}</h2>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>库存预警</span>
            </div>
          </template>
          <div class="card-body">
            <h2>{{ statistics.warningCount }}</h2>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日入库</span>
            </div>
          </template>
          <div class="card-body">
            <h2>{{ statistics.todayInbound }}</h2>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日出库</span>
            </div>
          </template>
          <div class="card-body">
            <h2>{{ statistics.todayOutbound }}</h2>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 预警列表 -->
    <el-card class="mb-20">
      <template #header>
        <div class="card-header">
          <span>库存预警</span>
        </div>
      </template>
      <el-table :data="warningList" style="width: 100%" v-loading="loading">
        <el-table-column prop="code" label="物料编号" width="120" />
        <el-table-column prop="name" label="物料名称" width="150" />
        <el-table-column prop="category" label="类别" width="120" />
        <el-table-column prop="stock" label="当前库存" width="120" />
        <el-table-column prop="minStock" label="最低库存" width="120" />
        <el-table-column prop="maxStock" label="最高库存" width="120" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getWarningType(row)" size="small">
              {{ getWarningText(row) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const statistics = ref({
  totalProducts: 0,
  warningCount: 0,
  todayInbound: 0,
  todayOutbound: 0
})
const warningList = ref([])

// 获取预警列表
const getWarningList = async () => {
  try {
    loading.value = true
    const res = await request.get('/products/warning', {
      params: {
        page: 1,
        limit: 5
      }
    })
    if (res?.code === 200 && res?.data?.list) {
      warningList.value = res.data.list
      statistics.value.warningCount = res.data.total
    }
  } catch (error) {
    console.error('获取预警列表失败:', error)
    ElMessage.error('获取预警列表失败')
  } finally {
    loading.value = false
  }
}

// 获取统计数据
const getStatistics = async () => {
  try {
    const [products, inbound, outbound] = await Promise.all([
      request.get('/products/list', { params: { page: 1, limit: 1 } }),
      request.get('/inbound/list', { params: { page: 1, limit: 1 } }),
      request.get('/outbound/list', { params: { page: 1, limit: 1 } })
    ])
    
    statistics.value.totalProducts = products?.data?.total || 0
    statistics.value.todayInbound = inbound?.data?.total || 0
    statistics.value.todayOutbound = outbound?.data?.total || 0
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  }
}

// 获取预警类型
const getWarningType = (row) => {
  if (row.stock === 0) return 'danger'
  if (row.stock < row.minStock) return 'warning'
  if (row.stock > row.maxStock) return 'info'
  return 'success'
}

// 获取预警文本
const getWarningText = (row) => {
  if (row.stock === 0) return '无库存'
  if (row.stock < row.minStock) return '库存不足'
  if (row.stock > row.maxStock) return '库存过高'
  return '正常'
}

onMounted(() => {
  getWarningList()
  getStatistics()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-body {
  text-align: center;
  padding: 20px 0;
}

.card-body h2 {
  margin: 0;
  font-size: 28px;
  color: #303133;
}
</style> 