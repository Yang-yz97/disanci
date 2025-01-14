<!-- 物料管理组件 -->
<template>
  <div class="materials">
    <!-- 搜索和操作栏 -->
    <div class="search-bar mb-20">
      <el-form :inline="true" :model="searchForm" class="form-inline">
        <el-form-item label="物料编号">
          <el-input v-model="searchForm.code" placeholder="请输入物料编号" clearable />
        </el-form-item>
        <el-form-item label="物料名称">
          <el-input v-model="searchForm.name" placeholder="请输入物料名称" clearable />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="请选择分类" clearable>
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" value="active" />
            <el-option label="停用" value="inactive" />
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

    <!-- 物料列表 -->
    <el-table
      v-loading="loading"
      :data="materialList"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="code" label="物料编号" width="120" />
      <el-table-column prop="name" label="物料名称" min-width="150" show-overflow-tooltip />
      <el-table-column prop="category" label="分类" width="120">
        <template #default="{ row }">
          {{ getCategoryLabel(row.category) }}
        </template>
      </el-table-column>
      <el-table-column prop="unit" label="单位" width="80" />
      <el-table-column prop="price" label="单价" width="120">
        <template #default="{ row }">
          ¥{{ row.price.toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
            {{ row.status === 'active' ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
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
      :title="dialogType === 'add' ? '新增物料' : '编辑物料'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="material-form"
      >
        <el-form-item label="物料编号" prop="code">
          <el-input v-model="form.code" placeholder="请输入物料编号" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="物料名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入物料名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="form.unit" placeholder="请输入单位" />
        </el-form-item>
        <el-form-item label="单价" prop="price">
          <el-input-number
            v-model="form.price"
            :min="0"
            :precision="2"
            :step="0.01"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
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
import { ElMessage } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Edit,
  Delete,
  Download
} from '@element-plus/icons-vue'
import materialService from '../services/material'

// 分类选项
const categoryOptions = [
  { label: '预埋件', value: '预埋件' },
  { label: '紧固件', value: '紧固件' },
  { label: '辅材', value: '辅材' },
  { label: '原材料', value: '原材料' },
  { label: '办公用品', value: '办公用品' },
  { label: '6S专用', value: '6S专用' },
  { label: '劳保用品', value: '劳保用品' },
  { label: '钢材', value: '钢材' }
]

// 搜索表单
const searchForm = reactive({
  code: '',
  name: '',
  category: '',
  status: ''
})

// 表单数据
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const form = reactive({
  code: '',
  name: '',
  category: '',
  unit: '',
  price: 0,
  status: 'active',
  remark: ''
})

// 表单验证规则
const rules = {
  code: [
    { required: true, message: '请输入物料编号', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入物料名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择物料分类', trigger: 'change' }
  ],
  unit: [
    { required: true, message: '请输入单位', trigger: 'blur' },
    { max: 10, message: '长度不能超过10个字符', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入单价', trigger: 'blur' },
    { type: 'number', min: 0, message: '单价不能小于0', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  remark: [
    { max: 200, message: '备注长度不能超过200个字符', trigger: 'blur' }
  ]
}

// 列表数据
const loading = ref(false)
const submitLoading = ref(false)
const materialList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedMaterials = ref([])

// 获取物料列表
const getMaterialList = async () => {
  try {
    loading.value = true
    const res = await materialService.getMaterialList({
      page: currentPage.value,
      limit: pageSize.value,
      ...searchForm
    })
    materialList.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('获取物料列表失败:', error)
    ElMessage.error('获取物料列表失败')
  } finally {
    loading.value = false
  }
}

// 处理查询
const handleSearch = () => {
  currentPage.value = 1
  getMaterialList()
}

// 处理重置
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1
  getMaterialList()
}

// 处理新增
const handleAdd = () => {
  dialogType.value = 'add'
  Object.keys(form).forEach(key => {
    form[key] = key === 'status' ? 'active' : key === 'price' ? 0 : ''
  })
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  dialogType.value = 'edit'
  const { id, createTime, ...rest } = row
  Object.keys(form).forEach(key => {
    form[key] = rest[key] || (key === 'price' ? 0 : '')
  })
  form.id = id
  dialogVisible.value = true
}

// 处理删除
const handleDelete = async (row) => {
  try {
    await materialService.deleteMaterial(row.id)
    ElMessage.success('删除成功')
    getMaterialList()
  } catch (error) {
    console.error('删除物料失败:', error)
    ElMessage.error(error.message || '删除失败')
  }
}

// 处理批量删除
const handleBatchDelete = async () => {
  if (!selectedMaterials.value.length) {
    ElMessage.warning('请选择要删除的物料')
    return
  }
  
  try {
    const ids = selectedMaterials.value.map(row => row.id)
    await materialService.batchDeleteMaterials(ids)
    ElMessage.success('批量删除成功')
    selectedMaterials.value = []
    getMaterialList()
  } catch (error) {
    console.error('批量删除物料失败:', error)
    ElMessage.error(error.message || '批量删除失败')
  }
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    const data = { ...form }
    
    if (dialogType.value === 'edit') {
      await materialService.updateMaterial(data.id, data)
      ElMessage.success('更新成功')
    } else {
      await materialService.createMaterial(data)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    getMaterialList()
  } catch (error) {
    console.error(dialogType.value === 'add' ? '新增物料失败:' : '更新物料失败:', error)
    ElMessage.error(error.message || (dialogType.value === 'add' ? '新增失败' : '更新失败'))
  }
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedMaterials.value = selection
}

// 处理分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  getMaterialList()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  getMaterialList()
}

// 处理导出
const handleExport = async () => {
  try {
    const res = await materialService.getMaterialList({
      responseType: 'blob'
    })
    
    // 创建下载链接
    const blob = new Blob([res], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `物料列表_${new Date().toLocaleString()}.xlsx`
    link.click()
    URL.revokeObjectURL(link.href)
  } catch (error) {
    console.error('导出物料失败:', error)
    ElMessage.error('导出物料失败')
  }
}

// 获取分类标签
const getCategoryLabel = (value) => {
  const option = categoryOptions.find(item => item.value === value)
  return option ? option.label : value
}

// 页面加载时获取列表数据
onMounted(() => {
  getMaterialList()
})
</script>

<style scoped>
.materials {
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

.material-form {
  max-height: 500px;
  overflow-y: auto;
}
</style> 