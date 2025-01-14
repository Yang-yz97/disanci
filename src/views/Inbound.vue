<template>
  <div class="inbound">
    <!-- 搜索和操作栏 -->
    <div class="search-bar mb-20">
      <el-form :inline="true" :model="searchForm" class="form-inline">
        <el-form-item label="入库单号">
          <el-input v-model="searchForm.code" placeholder="请输入入库单号" clearable />
        </el-form-item>
        <el-form-item label="入库日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
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
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增
        </el-button>
        <el-button type="warning" @click="handleExport">
          <el-icon><Download /></el-icon>导出
        </el-button>
        <el-button type="danger" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon>批量删除
        </el-button>
      </div>
    </div>

    <!-- 入库单列表 -->
    <el-table
      v-loading="loading"
      :data="inboundList"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      :summary-method="getSummaries"
      show-summary
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="date" label="入库日期" width="120">
        <template #default="{ row }">
          {{ row.date ? new Date(row.date).toLocaleDateString() : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="code" label="入库单号" width="150" />
      <el-table-column prop="supplierName" label="供应商" width="150" />
      <el-table-column prop="productName" label="物料名称" min-width="200" />
      <el-table-column prop="productCode" label="物料编码" width="120" />
      <el-table-column label="数量" width="120">
        <template #default="{ row }">
          {{ row.quantity }} {{ row.unit }}
        </template>
      </el-table-column>
      <el-table-column label="单价" width="120">
        <template #default="{ row }">
          ¥{{ row.price?.toLocaleString() || '0.00' }}
        </template>
      </el-table-column>
      <el-table-column label="金额" width="120">
        <template #default="{ row }">
          ¥{{ row.amount?.toLocaleString() || '0.00' }}
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
      <el-table-column prop="createTime" label="创建时间" width="180">
        <template #default="{ row }">
          {{ row.createTime ? new Date(row.createTime).toLocaleString() : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </el-button-group>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增入库单' : '编辑入库单'"
      width="800px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="inbound-form"
      >
        <el-form-item label="入库日期" prop="date">
          <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="请选择入库日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="供应商" prop="supplierId">
          <el-select
            v-model="form.supplierId"
            placeholder="请选择供应商"
            style="width: 100%"
            @visible-change="handleSupplierSelectOpen"
          >
            <el-option
              v-for="item in supplierOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <!-- 物料列表 -->
        <div class="item-list">
          <div class="item-list-header">
            <span>物料列表</span>
            <el-button type="primary" link @click="handleAddItem">
              <el-icon><Plus /></el-icon>添加物料
            </el-button>
          </div>
          <el-table :data="form.items" style="width: 100%">
            <el-table-column label="物料" min-width="200">
              <template #default="{ row }">
                <el-select
                  v-model="row.productId"
                  placeholder="请选择物料"
                  style="width: 100%"
                  filterable
                  @visible-change="handleProductSelectOpen"
                  @change="(val) => handleProductChange(val, row)"
                >
                  <el-option
                    v-for="item in productOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="unit" label="单位" width="100" />
            <el-table-column label="单价" width="120">
              <template #default="{ row }">
                ¥{{ row.price?.toLocaleString() || '0.00' }}
              </template>
            </el-table-column>
            <el-table-column label="数量" width="150">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.quantity"
                  :min="0"
                  :max="999999"
                  :precision="0"
                  :step="1"
                  style="width: 130px"
                  @change="calculateItemAmount(row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="金额" width="120">
              <template #default="{ row }">
                ¥{{ row.amount?.toLocaleString() || '0.00' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ $index }">
                <el-button type="danger" link @click="handleRemoveItem($index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入备注信息"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Edit,
  Delete,
  Download
} from '@element-plus/icons-vue'
import storage from '../utils/storage'
import inboundService from '../services/inbound'

// 搜索表单
const searchForm = reactive({
  code: '',
  dateRange: []
})

// 表单数据
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const currentId = ref('')
const form = reactive({
  date: '',
  supplierId: '',
  items: [],
  remark: ''
})

// 表单验证规则
const rules = {
  date: [
    { required: true, message: '请选择入库日期', trigger: 'change' }
  ],
  items: [
    { required: true, message: '请添加入库物料', trigger: 'change' },
    { 
      validator: (rule, value, callback) => {
        if (!value || !value.length) {
          callback(new Error('请添加入库物料'))
          return
        }
        
        const invalidItem = value.find(item => 
          !item.productId || 
          !item.quantity || 
          item.quantity <= 0 ||
          !item.price ||
          item.price < 0
        )
        
        if (invalidItem) {
          callback(new Error('请完善物料信息并确保数量和单价为正数'))
          return
        }
        
        callback()
      },
      trigger: 'change'
    }
  ]
}

// 列表数据
const loading = ref(false)
const submitLoading = ref(false)
const inboundList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedInbounds = ref([])

// 供应商和产品选项
const supplierOptions = ref([])
const productOptions = ref([])

// 获取入库单列表
const getInboundList = async () => {
  try {
    loading.value = true
    const inboundOrders = storage.getStorageData(storage.KEYS.INBOUND_ORDERS) || []
    
    // 根据搜索条件过滤
    const filteredOrders = inboundOrders.filter(order => {
      const matchOrderNo = !searchForm.code || order.code.includes(searchForm.code)
      const matchDate = !searchForm.dateRange?.length || 
        (order.date >= searchForm.dateRange[0] && order.date <= searchForm.dateRange[1])
      const matchSupplier = !searchForm.supplierId || order.supplierId === searchForm.supplierId
      return matchOrderNo && matchDate && matchSupplier
    })

    // 将每个入库单的物料展开为独立的行
    const expandedList = []
    filteredOrders.forEach(order => {
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          expandedList.push({
            id: order.id,
            date: order.date,
            code: order.code,
            supplierId: order.supplierId,
            supplierName: order.supplierName,
            remark: order.remark,
            createTime: order.createTime,
            // 物料相关信息
            productId: item.productId,
            productName: item.productName,
            productCode: item.code,
            unit: item.unit,
            quantity: item.quantity,
            price: item.price,
            amount: item.amount
          })
        })
      }
    })

    // 分页处理
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    inboundList.value = expandedList.slice(start, end)
    total.value = expandedList.length

  } catch (error) {
    console.error('获取入库单列表失败:', error)
    ElMessage.error('获取入库单列表失败')
  } finally {
    loading.value = false
  }
}

// 获取供应商列表
const getSupplierList = async () => {
  try {
    const suppliers = localStorage.getItem('suppliers')
    if (suppliers) {
      supplierOptions.value = JSON.parse(suppliers)
    } else {
      const res = await inboundService.getSupplierList()
      supplierOptions.value = res.data
    }
  } catch (error) {
    console.error('获取供应商列表失败:', error)
    ElMessage.error('获取供应商列表失败')
  }
}

// 获取产品列表
const getProductList = async () => {
  try {
    // 从本地存储获取产品列表
    const products = storage.getStorageData(storage.KEYS.PRODUCTS) || []
    productOptions.value = products.map(item => ({
      id: item.id,
      name: item.name,
      unit: item.unit,
      price: item.price || 0
    }))
  } catch (error) {
    console.error('获取产品列表失败:', error)
    ElMessage.error('获取产品列表失败')
  }
}

// 处理查询
const handleSearch = () => {
  currentPage.value = 1
  getInboundList()
}

// 处理重置
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = key === 'dateRange' ? [] : ''
  })
  currentPage.value = 1
  getInboundList()
}

// 处理新增
const handleAdd = () => {
  dialogType.value = 'add'
  Object.keys(form).forEach(key => {
    form[key] = key === 'items' ? [] : ''
  })
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  dialogType.value = 'edit'
  currentId.value = row.id
  Object.keys(form).forEach(key => {
    if (key === 'items') {
      form[key] = row[key]?.map(item => ({ ...item })) || []
    } else {
      form[key] = row[key]
    }
  })
  dialogVisible.value = true
}

// 处理删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该入库单？', '提示', {
      type: 'warning'
    })
    
    const inboundOrders = storage.getStorageData(storage.KEYS.INBOUND_ORDERS) || []
    const index = inboundOrders.findIndex(item => item.id === row.id)
    
    if (index !== -1) {
      inboundOrders.splice(index, 1)
      storage.setStorageData(storage.KEYS.INBOUND_ORDERS, inboundOrders)
      ElMessage.success('删除成功')
      
      // 重新获取列表数据
      getInboundList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除入库单失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 处理批量删除
const handleBatchDelete = async () => {
  if (!selectedInbounds.value.length) {
    ElMessage.warning('请选择要删除的入库单')
    return
  }
  
  try {
    await ElMessageBox.confirm('确认要删除选中的入库单吗？', '提示', {
      type: 'warning'
    })
    
    // 从本地存储中获取入库单列表
    const inboundOrders = storage.getStorageData(storage.KEYS.INBOUND_ORDERS) || []
    const ids = selectedInbounds.value.map(row => row.id)
    
    // 过滤掉要删除的入库单
    const filteredList = inboundOrders.filter(item => !ids.includes(item.id))
    
    // 更新本地存储
    storage.setStorageData(storage.KEYS.INBOUND_ORDERS, filteredList)
    
    ElMessage.success('批量删除成功')
    selectedInbounds.value = []
    getInboundList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除入库单失败:', error)
      ElMessage.error(error?.message || '批量删除失败')
    }
  }
}

// 生成订单号
const generateOrderNo = (prefix) => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${prefix}${year}${month}${day}${random}`
}

// 处理表单提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    // 获取现有入库单列表
    const inboundOrders = storage.getStorageData(storage.KEYS.INBOUND_ORDERS) || []
    
    // 验证物料数据
    const invalidItems = form.items.some(item => {
      const quantity = Number(item.quantity)
      const price = Number(item.price)
      return isNaN(quantity) || quantity <= 0 || isNaN(price) || price < 0
    })
    
    if (invalidItems) {
      ElMessage.error('物料数量和单价必须为正数')
      return
    }
    
    // 获取供应商信息
    const supplier = supplierOptions.value.find(s => s.id === form.supplierId)
    
    if (dialogType.value === 'add') {
      // 新增入库单
      const newOrder = {
        id: Date.now().toString(),
        code: generateOrderNo('RK'),
        ...form,
        supplierName: supplier?.name || '',
        items: form.items.map(item => {
          const product = productOptions.value.find(p => p.id === item.productId)
          return {
            ...item,
            productName: product?.name || '',
            quantity: Number(item.quantity),
            price: Number(item.price),
            amount: Number(item.quantity) * Number(item.price)
          }
        }),
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      }
      inboundOrders.unshift(newOrder)
    } else {
      // 更新入库单
      const index = inboundOrders.findIndex(item => item.id === currentId.value)
      if (index === -1) {
        ElMessage.error('未找到要更新的入库单')
        return
      }
      
      inboundOrders[index] = {
        ...inboundOrders[index],
        ...form,
        supplierName: supplier?.name || '',
        items: form.items.map(item => {
          const product = productOptions.value.find(p => p.id === item.productId)
          return {
            ...item,
            productName: product?.name || '',
            quantity: Number(item.quantity),
            price: Number(item.price),
            amount: Number(item.quantity) * Number(item.price)
          }
        }),
        updateTime: new Date().toISOString()
      }
    }
    
    // 保存更新后的列表
    const success = storage.setStorageData(storage.KEYS.INBOUND_ORDERS, inboundOrders)
    if (!success) {
      throw new Error('保存数据失败')
    }
    
    ElMessage.success(`${dialogType.value === 'add' ? '新增' : '更新'}成功`)
    dialogVisible.value = false
    
    // 重新获取列表数据
    getInboundList()
  } catch (error) {
    console.error('提交表单失败:', error)
    ElMessage.error(error.message || '提交失败,请检查数据后重试')
  } finally {
    submitLoading.value = false
  }
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedInbounds.value = selection
}

// 处理分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  getInboundList()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  getInboundList()
}

// 处理导出
const handleExport = () => {
  try {
    // 从本地存储获取所有入库单
    const inboundOrders = storage.getStorageData(storage.KEYS.INBOUND_ORDERS) || []
    
    // 根据搜索条件过滤
    const filteredList = inboundOrders.filter(item => {
      const matchOrderNo = !searchForm.code || item.orderNo.includes(searchForm.code)
      const matchDate = !searchForm.dateRange?.length || 
        (item.date >= searchForm.dateRange[0] && item.date <= searchForm.dateRange[1])
      return matchOrderNo && matchDate
    })
    
    // 转换为CSV格式
    const headers = ['入库日期', '物料名称', '数量', '单位', '单价', '金额', '备注', '创建时间']
    const rows = []
    
    // 添加表头
    rows.push(headers.join(','))
    
    // 添加数据行
    filteredList.forEach(order => {
      order.items.forEach(item => {
        const row = [
          order.date,
          item.productName,
          item.quantity,
          item.unit,
          item.price,
          item.amount,
          order.remark,
          new Date(order.createTime).toLocaleString()
        ]
        rows.push(row.join(','))
      })
    })
    
    // 创建Blob对象
    const csvContent = rows.join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
    
    // 创建下载链接
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `入库单列表_${new Date().toLocaleString()}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出入库单失败:', error)
    ElMessage.error('导出失败')
  }
}

// 处理供应商选择框打开
const handleSupplierSelectOpen = (visible) => {
  if (visible) {
    getSupplierList()
  }
}

// 处理产品选择框打开
const handleProductSelectOpen = (visible) => {
  if (visible) {
    // 每次打开选择框时都重新获取产品列表
    getProductList()
  }
}

// 处理物料选择变化
const handleProductChange = (productId, row) => {
  try {
    const product = productOptions.value.find(item => item.id === productId)
    if (product) {
      // 更新行数据
      row.unit = product.unit
      row.price = product.price || 0
      row.productName = product.name
      row.quantity = row.quantity || 1  // 设置默认数量
      
      // 计算金额
      calculateItemAmount(row)
    }
  } catch (error) {
    console.error('Error in handleProductChange:', error)
    ElMessage.error('选择物料时发生错误')
  }
}

// 计算物料金额
const calculateItemAmount = (row) => {
  try {
    const quantity = Number(row.quantity) || 0
    const price = Number(row.price) || 0
    row.amount = quantity * price
  } catch (error) {
    console.error('Error calculating amount:', error)
    ElMessage.error('计算金额时发生错误')
  }
}

// 添加物料
const handleAddItem = () => {
  try {
    form.items.push({
      productId: '',
      productName: '',
      unit: '',
      price: 0,
      quantity: 1,
      amount: 0
    })
  } catch (error) {
    console.error('Error in handleAddItem:', error)
    ElMessage.error('添加物料时发生错误')
  }
}

// 移除物料
const handleRemoveItem = (index) => {
  form.items.splice(index, 1)
  // 手动触发表单验证
  if (formRef.value) {
    formRef.value.validateField('items')
  }
}

// 页面加载时获取列表数据
onMounted(() => {
  getInboundList()
  getSupplierList()
  getProductList()
})
</script>

<style scoped>
.inbound {
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

.inbound-form {
  max-height: 600px;
  overflow-y: auto;
}

.item-list {
  margin-bottom: 20px;
}

.item-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 0 20px;
}

.material-info {
  margin-bottom: 5px;
}
.material-info:last-child {
  margin-bottom: 0;
}
.ml-10 {
  margin-left: 10px;
}
</style> 