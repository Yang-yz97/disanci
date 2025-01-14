<!-- 出库管理组件 -->
<template>
  <div class="outbound">
    <!-- 搜索和操作栏 -->
    <div class="search-bar mb-20">
      <el-form :inline="true" :model="searchForm" class="form-inline">
        <el-form-item label="出库单号">
          <el-input v-model="searchForm.code" placeholder="请输入出库单号" clearable />
        </el-form-item>
        <el-form-item label="出库日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="领用人">
          <el-select
            v-model="searchForm.teamId"
            placeholder="请选择领用人"
            clearable
            @visible-change="handleTeamSelectOpen"
          >
            <el-option
              v-for="item in teamOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
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

    <!-- 出库单列表 -->
    <el-table
      v-loading="loading"
      :data="outboundList"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="date" label="出库日期" width="120">
        <template #default="{ row }">
          {{ row.date ? new Date(row.date).toLocaleDateString() : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="code" label="出库单号" width="150" />
      <el-table-column prop="teamCode" label="领用人" width="120" />
      <el-table-column prop="teamName" label="团队名称" width="150" />
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
      :title="dialogType === 'add' ? '新增出库单' : '编辑出库单'"
      width="800px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="outbound-form"
      >
        <el-form-item label="出库日期" prop="date">
          <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="请选择出库日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="领用人" prop="teamId">
          <el-select
            v-model="form.teamId"
            placeholder="请选择领用人"
            clearable
            @visible-change="handleTeamSelectOpen"
          >
            <el-option
              v-for="item in teamOptions"
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
                  filterable
                  placeholder="请选择物料"
                  style="width: 100%"
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
                  :min="1"
                  :max="row.maxQuantity"
                  :precision="0"
                  :step="1"
                  style="width: 130px"
                  @change="() => calculateItemAmount(row)"
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
import { ref, reactive, onMounted } from 'vue'
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
import outboundService from '../services/outbound'
import { validateMaterial } from '../utils/materialData'

// 搜索表单
const searchForm = reactive({
  code: '',
  dateRange: [],
  teamId: ''
})

// 表单数据
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const currentId = ref('') // 添加当前编辑的记录ID
const form = ref({
  date: '',
  teamId: '',
  items: [],
  remark: ''
})

// 表单验证规则
const rules = {
  date: [
    { required: true, message: '请选择出库日期', trigger: 'change' }
  ],
  teamId: [
    { required: true, message: '请选择领用人', trigger: 'change' }
  ]
}

// 列表数据
const loading = ref(false)
const submitLoading = ref(false)
const outboundList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedOutbounds = ref([])

// 团队和产品选项
const teamOptions = ref([])
const productOptions = ref([])

// 物料列表
const materials = ref([])
// 选中的物料
const selectedMaterial = ref(null)

// 获取物料列表
const getMaterials = () => {
  try {
    const storedMaterials = JSON.parse(localStorage.getItem('materials') || '[]')
    materials.value = storedMaterials.map(item => ({
      ...item,
      label: item.name,  // 添加用于显示的label字段
      value: item.id     // 添加用于选择的value字段
    }))
  } catch (error) {
    console.error('Error loading materials:', error)
    ElMessage.error('加载物料列表失败')
  }
}

// 处理物料选择
const handleMaterialSelect = (material) => {
  console.log('Selected material:', material)
  if (!material) {
    console.warn('No material selected')
    return
  }
  
  try {
    const selectedMat = materials.value.find(m => m.id === material.value)
    console.log('Found material:', selectedMat)
    
    if (!selectedMat) {
      console.warn('Material not found in list')
      ElMessage.warning('未找到选中的物料信息')
      return
    }

    // 验证物料数据完整性
    if (!validateMaterial(selectedMat)) {
      console.error('Invalid material data:', selectedMat)
      ElMessage.error('物料数据不完整')
      return
    }

    // 更新表单数据
    form.value = {
      ...form.value,
      materialId: selectedMat.id,
      materialName: selectedMat.name,
      unit: selectedMat.unit,
      price: selectedMat.price || 0,
      quantity: 1
    }

    console.log('Updated form:', form.value)
    calculateAmount()
  } catch (error) {
    console.error('Error in handleMaterialSelect:', error)
    ElMessage.error('选择物料时发生错误')
  }
}

// 计算金额
const calculateAmount = () => {
  if (form.value.price && form.value.quantity) {
    form.value.amount = form.value.price * form.value.quantity
  }
}

// 监听物料选择框的变化
const handleMaterialChange = (value) => {
  if (!value) {
    // 清空相关字段
    form.value.materialId = ''
    form.value.materialName = ''
    form.value.unit = ''
    form.value.price = 0
    form.value.quantity = 1
    form.value.amount = 0
    return
  }
  
  handleMaterialSelect({ value })
}

// 获取出库单列表
const getOutboundList = async () => {
  try {
    loading.value = true
    const outboundOrders = storage.getStorageData(storage.KEYS.OUTBOUND_ORDERS) || []
    
    // 根据搜索条件过滤
    const filteredOrders = outboundOrders.filter(order => {
      const matchOrderNo = !searchForm.code || order.code.includes(searchForm.code)
      const matchDate = !searchForm.dateRange?.length || 
        (order.date >= searchForm.dateRange[0] && order.date <= searchForm.dateRange[1])
      const matchTeam = !searchForm.teamId || order.teamId === searchForm.teamId
      return matchOrderNo && matchDate && matchTeam
    })

    // 将每个出库单的物料展开为独立的行
    const expandedList = []
    filteredOrders.forEach(order => {
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          expandedList.push({
            id: order.id,
            date: order.date,
            code: order.code,
            teamId: order.teamId,
            teamCode: order.teamCode,
            teamName: order.teamName,
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
    outboundList.value = expandedList.slice(start, end)
    total.value = expandedList.length

  } catch (error) {
    console.error('获取出库单列表失败:', error)
    ElMessage.error('获取出库单列表失败')
  } finally {
    loading.value = false
  }
}

// 获取团队列表
const getTeamList = async () => {
  try {
    // 从本地存储获取团队列表
    const teams = storage.getStorageData(storage.KEYS.TEAMS) || []
    teamOptions.value = teams.map(item => ({
      id: item.code, // 使用领用人编号作为id
      name: `${item.code} - ${item.name}`, // 显示格式：领用人 - 团队名称
      code: item.code,
      teamName: item.name
    }))
  } catch (error) {
    console.error('获取领用人列表失败:', error)
    ElMessage.error('获取领用人列表失败')
  }
}

// 获取产品列表
const getProductList = async () => {
  try {
    const products = storage.getStorageData(storage.KEYS.PRODUCTS) || []
    productOptions.value = products.map(item => ({
      id: item.id,
      name: item.name,
      code: item.code || '',
      unit: item.unit || '个',
      price: Number(item.price) || 0
    })).filter(item => item.name && item.unit) // 过滤掉无效数据
  } catch (error) {
    console.error('获取产品列表失败:', error)
    ElMessage.error('获取产品列表失败')
  }
}

// 处理查询
const handleSearch = () => {
  currentPage.value = 1
  getOutboundList()
}

// 处理重置
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = key === 'dateRange' ? [] : ''
  })
  currentPage.value = 1
  getOutboundList()
}

// 处理新增
const handleAdd = () => {
  dialogType.value = 'add'
  // 重置表单数据
  form.value = {
    date: '',
    teamId: '',
    items: [],
    remark: ''
  }
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  dialogType.value = 'edit'
  currentId.value = row.id
  // 复制数据到表单
  form.value = {
    date: row.date || '',
    teamId: row.teamId || '',
    items: row.items?.map(item => ({ ...item })) || [],
    remark: row.remark || ''
  }
  dialogVisible.value = true
}

// 处理删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该出库单？', '提示', {
      type: 'warning'
    })
    
    const outboundOrders = storage.getStorageData(storage.KEYS.OUTBOUND_ORDERS) || []
    const index = outboundOrders.findIndex(item => item.id === row.id)
    
    if (index !== -1) {
      outboundOrders.splice(index, 1)
      storage.setStorageData(storage.KEYS.OUTBOUND_ORDERS, outboundOrders)
      ElMessage.success('删除成功')
      
      // 重新获取列表数据
      getOutboundList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除出库单失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 处理批量删除
const handleBatchDelete = async () => {
  if (!selectedOutbounds.value.length) {
    ElMessage.warning('请选择要删除的出库单')
    return
  }
  
  try {
    await ElMessageBox.confirm('确认要删除选中的出库单吗？', '提示', {
      type: 'warning'
    })
    
    // 从本地存储中获取出库单列表
    const outboundOrders = storage.getStorageData(storage.KEYS.OUTBOUND_ORDERS) || []
    const ids = selectedOutbounds.value.map(row => row.id)
    
    // 过滤掉要删除的出库单
    const filteredList = outboundOrders.filter(item => !ids.includes(item.id))
    
    // 更新本地存储
    storage.setStorageData(storage.KEYS.OUTBOUND_ORDERS, filteredList)
    
    ElMessage.success('批量删除成功')
    selectedOutbounds.value = []
    getOutboundList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除出库单失败:', error)
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
    // 验证基本表单字段
    await formRef.value.validate()
    
    // 验证物料列表
    if (!form.value.items.length) {
      ElMessage.error('请至少添加一个物料')
      return
    }
    
    // 验证每个物料的数据
    const invalidItem = form.value.items.find(item => 
      !item.productId || 
      !item.quantity || 
      item.quantity <= 0
    )
    
    if (invalidItem) {
      ElMessage.error('请完善物料信息并确保数量大于0')
      return
    }
    
    submitLoading.value = true
    
    // 获取现有出库单列表
    const outboundOrders = storage.getStorageData(storage.KEYS.OUTBOUND_ORDERS) || []
    
    // 获取团队信息
    const team = teamOptions.value.find(t => t.id === form.value.teamId)
    if (!team) {
      ElMessage.error('未找到选择的领用人信息')
      return
    }
    
    if (dialogType.value === 'add') {
      // 新增出库单
      const newOrder = {
        id: Date.now().toString(),
        code: generateOrderNo('CK'),
        ...form.value,
        teamName: team.teamName || '',
        teamCode: team.code || '',
        items: form.value.items.map(item => {
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
      outboundOrders.unshift(newOrder)
    } else {
      // 更新出库单
      const index = outboundOrders.findIndex(item => item.id === currentId.value)
      if (index === -1) {
        ElMessage.error('未找到要更新的出库单')
        return
      }
      
      outboundOrders[index] = {
        ...outboundOrders[index],
        ...form.value,
        teamName: team.teamName || '',
        teamCode: team.code || '',
        items: form.value.items.map(item => {
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
    const success = storage.setStorageData(storage.KEYS.OUTBOUND_ORDERS, outboundOrders)
    if (!success) {
      throw new Error('保存数据失败')
    }
    
    ElMessage.success(`${dialogType.value === 'add' ? '新增' : '更新'}成功`)
    dialogVisible.value = false
    
    // 重新获取列表数据
    getOutboundList()
  } catch (error) {
    console.error('提交表单失败:', error)
    ElMessage.error(error.message || '提交失败,请检查数据后重试')
  } finally {
    submitLoading.value = false
  }
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  // 根据选中的行找到对应的出库单ID
  const selectedIds = new Set(selection.map(row => row.id))
  selectedOutbounds.value = Array.from(selectedIds)
}

// 处理分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  getOutboundList()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  getOutboundList()
}

// 处理导出
const handleExport = () => {
  try {
    // 从本地存储获取所有出库单
    const outboundOrders = storage.getStorageData(storage.KEYS.OUTBOUND_ORDERS) || []
    
    // 根据搜索条件过滤
    const filteredList = outboundOrders.filter(item => {
      const matchOrderNo = !searchForm.code || item.orderNo.includes(searchForm.code)
      const matchDate = !searchForm.dateRange?.length || 
        (item.date >= searchForm.dateRange[0] && item.date <= searchForm.dateRange[1])
      const matchTeam = !searchForm.teamId || item.teamId === searchForm.teamId
      return matchOrderNo && matchDate && matchTeam
    })
    
    // 转换为CSV格式
    const headers = ['出库日期', '领用人', '团队名称', '物料名称', '数量', '单位', '单价', '金额', '备注', '创建时间']
    const rows = []
    
    // 添加表头
    rows.push(headers.join(','))
    
    // 添加数据行
    filteredList.forEach(order => {
      order.items.forEach(item => {
        const row = [
          order.date,
          order.teamCode,
          order.teamName,
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
    link.download = `出库单列表_${new Date().toLocaleString()}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出出库单失败:', error)
    ElMessage.error('导出失败')
  }
}

// 处理团队选择框打开
const handleTeamSelectOpen = (visible) => {
  if (visible) {
    // 每次打开选择框时都重新获取团队列表
    getTeamList()
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
  console.log('Product change:', { productId, row })
  
  try {
    if (!productId) {
      console.warn('No product ID provided')
      return
    }
    
    const product = productOptions.value.find(item => item.id === productId)
    console.log('Found product:', product)
    
    if (!product) {
      console.warn('Product not found:', productId)
      ElMessage.warning('未找到选中的物料信息')
      return
    }
    
    // 创建新的行数据
    const updatedRow = {
      productId: product.id,
      productName: product.name,
      code: product.code || '',
      unit: product.unit,
      price: Number(product.price) || 0,
      quantity: 1,
      amount: Number(product.price) || 0 // 初始金额等于单价（因为数量为1）
    }
    
    console.log('Updated row:', updatedRow)
    
    // 更新数组中的对象
    const index = form.value.items.indexOf(row)
    if (index !== -1) {
      form.value.items.splice(index, 1, updatedRow)
    }
  } catch (error) {
    console.error('Error in handleProductChange:', error)
    ElMessage.error('选择物料时发生错误')
  }
}

// 计算物料金额
const calculateItemAmount = (row) => {
  try {
    const index = form.value.items.indexOf(row)
    if (index !== -1) {
      const updatedRow = {
        ...row,
        amount: (row.quantity || 0) * (row.price || 0)
      }
      form.value.items.splice(index, 1, updatedRow)
    }
  } catch (error) {
    console.error('Error in calculateItemAmount:', error)
    ElMessage.error('计算金额时发生错误')
  }
}

// 添加物料
const handleAddItem = () => {
  try {
    const newItem = {
      productId: '',
      productName: '',
      unit: '',
      price: 0,
      quantity: 1,
      amount: 0
    }
    // 确保 items 数组存在
    if (!form.value.items) {
      form.value.items = []
    }
    form.value.items.push(newItem)
  } catch (error) {
    console.error('Error in handleAddItem:', error)
    ElMessage.error('添加物料时发生错误')
  }
}

// 移除物料
const handleRemoveItem = (index) => {
  try {
    if (Array.isArray(form.value.items)) {
      form.value.items.splice(index, 1)
    }
  } catch (error) {
    console.error('Error in handleRemoveItem:', error)
    ElMessage.error('移除物料时发生错误')
  }
}

// 页面加载时获取列表数据
onMounted(() => {
  getOutboundList()
  getTeamList()
  getProductList()
  getMaterials()
  
  // 添加调试信息
  console.log('Initial product options:', productOptions.value)
  
  // 监听点击事件
  document.addEventListener('click', (e) => {
    console.log('Clicked element:', e.target)
  })
  
  // 检查本地存储中的数据
  const products = storage.getStorageData(storage.KEYS.PRODUCTS)
  const materials = storage.getStorageData(storage.KEYS.MATERIALS)
  
  console.log('Local storage data:', {
    products,
    materials,
    PRODUCTS_KEY: storage.KEYS.PRODUCTS,
    MATERIALS_KEY: storage.KEYS.MATERIALS
  })
})

// 添加合计行计算方法
const getSummaries = (param) => {
  const { columns, data } = param
  const sums = []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计'
      return
    }
    
    if (['quantity', 'amount'].includes(column.property)) {
      const values = data.map(item => Number(item[column.property]) || 0)
      sums[index] = values.reduce((prev, curr) => prev + curr, 0)
      
      if (column.property === 'amount') {
        sums[index] = '¥' + sums[index].toLocaleString()
      }
    } else {
      sums[index] = ''
    }
  })
  
  return sums
}
</script>

<style scoped>
.outbound {
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

.outbound-form {
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

.el-select {
  width: 100%;
}

/* 确保下拉选项可以显示完整的文本 */
:deep(.el-select-dropdown__item) {
  white-space: normal;
  height: auto;
  padding: 8px 12px;
}

.material-option {
  cursor: pointer;
}

.material-option-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.material-info {
  color: #409EFF;
  font-size: 0.9em;
}

/* 确保下拉选项可以点击 */
:deep(.el-select-dropdown__item) {
  white-space: normal;
  height: auto;
  padding: 8px 12px;
  cursor: pointer !important;
}

:deep(.el-select-dropdown__item.hover) {
  background-color: #f5f7fa;
}

:deep(.el-select-dropdown__item.selected) {
  background-color: #f0f9eb;
}

/* 移除重复的样式定义 */
:deep(.el-select-dropdown__item) {
  padding: 8px 12px !important;
  height: auto !important;
  line-height: 1.5 !important;
  cursor: pointer !important;
  user-select: none;
}

:deep(.material-option-content) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  pointer-events: auto !important;
}

:deep(.material-name) {
  flex: 1;
  padding-right: 10px;
}

:deep(.material-stock) {
  color: #409EFF;
  font-size: 0.9em;
  white-space: nowrap;
}

/* 添加悬停效果 */
:deep(.el-select-dropdown__item:hover) {
  background-color: #f5f7fa !important;
}

:deep(.el-select-dropdown__item.selected) {
  background-color: #f0f9eb !important;
}

/* 确保下拉菜单可以正常点击 */
:deep(.el-select-dropdown) {
  pointer-events: auto !important;
}

:deep(.el-select-dropdown__list) {
  pointer-events: auto !important;
}
</style> 