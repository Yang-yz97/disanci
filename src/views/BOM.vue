<template>
  <div class="bom">
    <!-- 搜索和操作栏 -->
    <div class="search-bar mb-20">
      <el-form :inline="true" :model="searchForm" class="form-inline">
        <el-form-item label="项目编号">
          <el-input v-model="searchForm.projectCode" placeholder="请输入项目编号" clearable />
        </el-form-item>
        <el-form-item label="项目名称">
          <el-input v-model="searchForm.projectName" placeholder="请输入项目名称" clearable />
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
      </div>
    </div>

    <!-- BOM列表 -->
    <el-table
      v-loading="loading"
      :data="bomList"
      style="width: 100%"
    >
      <el-table-column prop="projectCode" label="项目编号" width="150" />
      <el-table-column prop="projectName" label="项目名称" width="200" />
      <el-table-column label="物料需求" min-width="400">
        <template #default="{ row }">
          <el-table :data="row.materials" style="width: 100%">
            <el-table-column prop="name" label="物料名称" width="200" />
            <el-table-column prop="spec" label="规格" width="150" />
            <el-table-column prop="unit" label="单位" width="100" />
            <el-table-column prop="quantity" label="需求数量" width="120" />
            <el-table-column prop="purchasedQuantity" label="已采购数量" width="120" />
            <el-table-column prop="remainingQuantity" label="剩余采购量" width="120">
              <template #default="{ row }">
                {{ row.quantity - (row.purchasedQuantity || 0) }}
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
      <el-table-column prop="createTime" label="创建时间" width="180">
        <template #default="{ row }">
          {{ new Date(row.createTime).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
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
      :title="dialogType === 'add' ? '新增BOM' : '编辑BOM'"
      width="800px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="bom-form"
      >
        <el-form-item label="项目编号" prop="projectCode">
          <el-input v-model="form.projectCode" placeholder="请输入项目编号" />
        </el-form-item>
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="form.projectName" placeholder="请输入项目名称" />
        </el-form-item>
        
        <!-- 物料列表 -->
        <div class="material-list">
          <div class="material-list-header">
            <span>物料需求</span>
            <el-button type="primary" link @click="handleAddMaterial">
              <el-icon><Plus /></el-icon>添加物料
            </el-button>
          </div>
          <el-table :data="form.materials" style="width: 100%">
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
            <el-table-column prop="spec" label="规格" width="150" />
            <el-table-column prop="unit" label="单位" width="100" />
            <el-table-column label="需求数量" width="150">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.quantity"
                  :min="1"
                  :precision="0"
                  :step="1"
                  style="width: 130px"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="{ $index }">
                <el-button type="danger" link @click="handleRemoveMaterial($index)">
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
import { storage } from '@/utils/storage'

// 搜索表单
const searchForm = reactive({
  projectCode: '',
  projectName: ''
})

// 表单数据
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const currentId = ref('')
const form = ref({
  projectCode: '',
  projectName: '',
  materials: [],
  remark: ''
})

// 表单验证规则
const rules = {
  projectCode: [
    { required: true, message: '请输入项目编号', trigger: 'blur' },
    { min: 3, max: 20, message: '项目编号长度应在3-20个字符之间', trigger: 'blur' }
  ],
  projectName: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 50, message: '项目名称长度应在2-50个字符之间', trigger: 'blur' }
  ],
  materials: [
    { required: true, message: '请添加物料需求', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (!value || !value.length) {
          callback(new Error('请添加物料需求'))
          return
        }
        
        const invalidItem = value.find(item => 
          !item.productId || 
          !item.requiredQuantity || 
          item.requiredQuantity <= 0
        )
        
        if (invalidItem) {
          callback(new Error('请完善物料信息并确保需求数量为正数'))
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
const bomList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 产品选项
const productOptions = ref([])

// 获取BOM列表
const getBOMList = async () => {
  try {
    loading.value = true
    const boms = storage.getStorageData(storage.KEYS.BOM_LIST) || []
    
    // 根据搜索条件过滤
    let filteredList = [...boms]
    if (searchForm.projectCode) {
      filteredList = filteredList.filter(item => 
        item.projectCode.toLowerCase().includes(searchForm.projectCode.toLowerCase())
      )
    }
    if (searchForm.projectName) {
      filteredList = filteredList.filter(item => 
        item.projectName.toLowerCase().includes(searchForm.projectName.toLowerCase())
      )
    }
    
    // 分页处理
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    
    bomList.value = filteredList.slice(start, end)
    total.value = filteredList.length
  } catch (error) {
    console.error('获取BOM列表失败:', error)
    ElMessage.error('获取BOM列表失败')
  } finally {
    loading.value = false
  }
}

// 获取产品列表
const getProductList = async () => {
  try {
    const products = storage.getStorageData(storage.KEYS.PRODUCTS) || []
    productOptions.value = products.map(item => ({
      id: item.id,
      name: item.name,
      unit: item.unit,
      code: item.code
    }))
  } catch (error) {
    console.error('获取产品列表失败:', error)
    ElMessage.error('获取产品列表失败')
  }
}

// 处理查询
const handleSearch = () => {
  const boms = storage.getStorageData('boms') || []
  let filteredList = [...boms]
  
  if (searchForm.projectCode) {
    filteredList = filteredList.filter(item => 
      item.projectCode.toLowerCase().includes(searchForm.projectCode.toLowerCase())
    )
  }
  if (searchForm.projectName) {
    filteredList = filteredList.filter(item => 
      item.projectName.toLowerCase().includes(searchForm.projectName.toLowerCase())
    )
  }
  
  bomList.value = filteredList
  total.value = filteredList.length
}

// 处理重置
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  getBOMList()
}

// 处理新增
const handleAdd = () => {
  dialogType.value = 'add'
  currentId.value = ''
  form.value = {
    projectCode: '',
    projectName: '',
    materials: [],
    remark: ''
  }
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  dialogType.value = 'edit'
  currentId.value = row.id
  form.value = JSON.parse(JSON.stringify(row))
  dialogVisible.value = true
}

// 处理删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该BOM?', '提示', {
      type: 'warning'
    })
    
    const boms = storage.getStorageData(storage.KEYS.BOM_LIST) || []
    const index = boms.findIndex(item => item.id === row.id)
    
    if (index === -1) {
      throw new Error('未找到要删除的BOM')
    }
    
    boms.splice(index, 1)
    const success = storage.setStorageData(storage.KEYS.BOM_LIST, boms)
    
    if (!success) {
      throw new Error('删除失败')
    }
    
    ElMessage.success('删除成功')
    getBOMList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除BOM失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 处理批量删除
const handleBatchDelete = async () => {
  if (!selectedBOMs.value.length) {
    ElMessage.warning('请选择要删除的BOM')
    return
  }
  
  try {
    await ElMessageBox.confirm('确认删除选中的BOM?', '提示', {
      type: 'warning'
    })
    
    const boms = storage.getStorageData(storage.KEYS.BOM_LIST) || []
    const ids = selectedBOMs.value.map(row => row.id)
    
    const filteredList = boms.filter(item => !ids.includes(item.id))
    const success = storage.setStorageData(storage.KEYS.BOM_LIST, filteredList)
    
    if (!success) {
      throw new Error('批量删除失败')
    }
    
    ElMessage.success('批量删除成功')
    selectedBOMs.value = []
    getBOMList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除BOM失败:', error)
      ElMessage.error(error.message || '批量删除失败')
    }
  }
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    // 验证物料数据
    const invalidItems = form.value.materials.some(item => {
      const quantity = Number(item.requiredQuantity)
      return isNaN(quantity) || quantity <= 0
    })
    
    if (invalidItems) {
      ElMessage.error('物料需求数量必须为正数')
      return
    }
    
    const boms = storage.getStorageData(storage.KEYS.BOM_LIST) || []
    const now = Date.now()
    
    // 检查项目编号是否重复
    const existingBOM = boms.find(item => 
      item.projectCode === form.value.projectCode && 
      (!currentId.value || item.id !== currentId.value)
    )
    
    if (existingBOM) {
      throw new Error('项目编号已存在')
    }
    
    if (currentId.value) {
      // 更新已有BOM
      const index = boms.findIndex(item => item.id === currentId.value)
      if (index === -1) {
        throw new Error('未找到要更新的BOM')
      }
      
      boms[index] = {
        ...boms[index],
        ...form.value,
        materials: form.value.materials.map(item => ({
          ...item,
          requiredQuantity: Number(item.requiredQuantity),
          purchasedQuantity: Number(item.purchasedQuantity || 0)
        })),
        updateTime: now
      }
    } else {
      // 创建新BOM
      const newBom = {
        ...form.value,
        id: generateId(),
        materials: form.value.materials.map(item => ({
          ...item,
          requiredQuantity: Number(item.requiredQuantity),
          purchasedQuantity: 0
        })),
        createTime: now,
        updateTime: now
      }
      boms.push(newBom)
    }
    
    const success = storage.setStorageData(storage.KEYS.BOM_LIST, boms)
    if (!success) {
      throw new Error('保存失败')
    }
    
    ElMessage.success(currentId.value ? '更新成功' : '创建成功')
    dialogVisible.value = false
    getBOMList()
  } catch (error) {
    console.error('保存BOM失败:', error)
    ElMessage.error(error.message || '保存失败')
  } finally {
    submitLoading.value = false
  }
}

// 处理分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  getBOMList()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  getBOMList()
}

// 处理导出
const handleExport = () => {
  try {
    // 从本地存储获取所有BOM
    const boms = storage.getStorageData(storage.KEYS.BOM_LIST) || []
    
    // 根据搜索条件过滤
    let filteredList = [...boms]
    if (searchForm.projectCode) {
      filteredList = filteredList.filter(item => 
        item.projectCode.toLowerCase().includes(searchForm.projectCode.toLowerCase())
      )
    }
    if (searchForm.projectName) {
      filteredList = filteredList.filter(item => 
        item.projectName.toLowerCase().includes(searchForm.projectName.toLowerCase())
      )
    }
    
    if (!filteredList.length) {
      ElMessage.warning('没有符合条件的数据可导出')
      return
    }
    
    // 转换为CSV格式
    const headers = ['项目编号', '项目名称', '物料编号', '物料名称', '单位', '需求数量', '已采购数量', '剩余采购量', '备注', '创建时间']
    const rows = []
    
    // 添加表头
    rows.push(headers.join(','))
    
    // 添加数据行
    filteredList.forEach(bom => {
      bom.materials.forEach(material => {
        const remainingQuantity = material.requiredQuantity - (material.purchasedQuantity || 0)
        const row = [
          bom.projectCode,
          bom.projectName,
          material.productId,
          material.productName,
          material.unit,
          material.requiredQuantity,
          material.purchasedQuantity || 0,
          remainingQuantity,
          bom.remark || '',
          new Date(bom.createTime).toLocaleString()
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
    link.download = `BOM清单_${new Date().toLocaleString()}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出BOM失败:', error)
    ElMessage.error('导出失败')
  }
}

// 处理物料选择变化
const handleProductChange = (productId, row) => {
  const product = productOptions.value.find(item => item.id === productId)
  if (product) {
    row.unit = product.unit
    row.name = product.name
    row.code = product.code
  }
}

// 添加物料
const handleAddMaterial = () => {
  form.value.materials.push({
    productId: '',
    quantity: 0,
    purchasedQuantity: 0
  })
}

// 移除物料
const handleRemoveMaterial = (index) => {
  form.value.materials.splice(index, 1)
}

// 生成唯一ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 页面加载时获取数据
onMounted(() => {
  getBOMList()
  getProductList()
})
</script>

<style scoped>
.bom {
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

.bom-form {
  max-height: 600px;
  overflow-y: auto;
}

.material-list {
  margin-bottom: 20px;
}

.material-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 0 20px;
}
</style> 