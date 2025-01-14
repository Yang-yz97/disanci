<template>
  <div class="special-inbound">
    <div class="page-header">
      <h2 class="page-title">特殊物料入库</h2>
      <el-select 
        v-model="inboundType" 
        placeholder="请选择入库类型" 
        @change="handleTypeChange"
        class="type-selector"
      >
        <el-option label="模具入库" value="mould">
          <span class="option-label">
            <el-icon class="option-icon"><Tools /></el-icon>
            模具入库
          </span>
        </el-option>
        <el-option label="桁架筋入库" value="truss">
          <span class="option-label">
            <el-icon class="option-icon"><Connection /></el-icon>
            桁架筋入库
          </span>
        </el-option>
        <el-option label="钢筋入库" value="rebar">
          <span class="option-label">
            <el-icon class="option-icon"><Histogram /></el-icon>
            钢筋入库
          </span>
        </el-option>
      </el-select>
    </div>

    <div class="content-card">
      <el-table 
        :data="tableData" 
        border 
        style="width: 100%"
        :header-cell-style="{
          background: 'var(--el-color-primary-light-8)',
          color: 'var(--el-color-primary)',
          fontWeight: 'bold'
        }"
        :cell-style="{
          padding: '8px 0'
        }"
      >
        <el-table-column prop="name" label="名称" min-width="150">
          <template #default="{ row }">
            <el-input 
              v-model="row.name" 
              placeholder="请输入名称"
              class="custom-input"
            />
          </template>
        </el-table-column>
        
        <el-table-column prop="spec" label="型号" min-width="120">
          <template #default="{ row }">
            <el-input 
              v-model="row.spec" 
              placeholder="请输入型号"
              class="custom-input"
            />
          </template>
        </el-table-column>
        
        <el-table-column prop="quantity" label="数量" width="120">
          <template #default="{ row }">
            <el-input-number 
              v-model="row.quantity" 
              :min="0" 
              :precision="2"
              :step="1"
              class="custom-number-input"
            />
          </template>
        </el-table-column>
        
        <el-table-column prop="unit" label="单位" width="120">
          <template #default="{ row }">
            <el-input 
              v-model="row.unit" 
              placeholder="请输入单位"
              class="custom-input"
            />
          </template>
        </el-table-column>
        
        <el-table-column prop="weight" label="重量(KG)" width="120">
          <template #default="{ row }">
            <el-input-number 
              v-model="row.weight" 
              :min="0" 
              :precision="2"
              :step="0.1"
              class="custom-number-input"
            />
          </template>
        </el-table-column>
        
        <el-table-column prop="arrivalDate" label="到货日期" width="180">
          <template #default="{ row }">
            <el-date-picker
              v-model="row.arrivalDate"
              type="date"
              placeholder="选择到货日期"
              class="custom-date-picker"
            />
          </template>
        </el-table-column>
        
        <el-table-column prop="supplier" label="供应商" min-width="150">
          <template #default="{ row }">
            <el-input 
              v-model="row.supplier" 
              placeholder="请输入供应商"
              class="custom-input"
            />
          </template>
        </el-table-column>
        
        <el-table-column prop="images" label="图片" width="120">
          <template #default="{ row }">
            <el-upload
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :on-change="(file) => handleImageChange(file, row)"
              :limit="5"
              class="custom-upload"
            >
              <div class="upload-content">
                <el-icon class="upload-icon"><Plus /></el-icon>
                <span class="upload-text">上传图片</span>
              </div>
            </el-upload>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ $index }">
            <el-button 
              type="danger" 
              link 
              @click="handleDelete($index)"
              class="delete-button"
            >
              <el-icon><Delete /></el-icon>
              <span>删除</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="footer">
        <el-button 
          type="primary" 
          @click="handleAddRow"
          class="custom-button add-button"
        >
          <el-icon><Plus /></el-icon>
          <span>添加记录</span>
        </el-button>
        <el-button 
          type="success" 
          @click="handleSave" 
          :loading="saving"
          class="custom-button save-button"
        >
          <el-icon><Check /></el-icon>
          <span>保存数据</span>
        </el-button>
      </div>
    </div>

    <div class="operation-bar mb-20">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增入库
      </el-button>
    </div>

    <el-tabs v-model="activeTab" class="inbound-tabs">
      <el-tab-pane label="模具入库" name="mould">
        <!-- 模具入库列表 -->
      </el-tab-pane>
      <el-tab-pane label="桁架入库" name="truss">
        <!-- 桁架入库列表 -->
      </el-tab-pane>
      <el-tab-pane label="钢筋入库" name="rebar">
        <!-- 钢筋入库列表 -->
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增入库' : '编辑入库'"
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
        <el-form-item label="入库类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择入库类型" style="width: 100%">
            <el-option label="模具入库" value="mould" />
            <el-option label="桁架入库" value="truss" />
            <el-option label="钢筋入库" value="rebar" />
          </el-select>
        </el-form-item>
        
        <div class="material-list">
          <div class="material-list-header">
            <span>物料信息</span>
            <el-button type="primary" link @click="handleAddMaterial">
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
            <el-table-column label="数量" width="150">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.quantity"
                  :min="1"
                  :precision="0"
                  :step="1"
                  style="width: 130px"
                  @change="handleQuantityChange(row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="单价" width="150">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.price"
                  :min="0"
                  :precision="2"
                  :step="0.01"
                  style="width: 130px"
                  @change="handlePriceChange(row)"
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
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, 
  Delete, 
  Check,
  Tools,
  Connection,
  Histogram 
} from '@element-plus/icons-vue'
import { storage } from '@/utils/storage'

// 入库类型
const inboundType = ref('mould')
const tableData = ref([])
const saving = ref(false)

// 初始化一条空记录
const getEmptyRow = () => ({
  name: '',
  spec: '',
  quantity: 0,
  unit: '',
  weight: 0,
  arrivalDate: '',
  supplier: '',
  images: []
})

// 加载已有数据
const loadExistingData = () => {
  try {
    const storageKey = `${inboundType.value}_inbound_list`
    const data = storage.getStorageData(storageKey)
    if (data && data.length > 0) {
      // 只显示最近的一条记录
      const latestRecord = data[data.length - 1]
      if (latestRecord.items && latestRecord.items.length > 0) {
        tableData.value = latestRecord.items.map(item => ({
          ...item,
          images: [...(item.images || [])] // 创建图片数组的副本
        }))
      }
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载历史数据失败')
    // 确保表格至少有一行
    tableData.value = [getEmptyRow()]
  }
}

// 处理类型变化
const handleTypeChange = (type) => {
  inboundType.value = type
  loadExistingData()
}

// 处理添加行
const handleAddRow = () => {
  tableData.value.push(getEmptyRow())
}

// 处理删除行
const handleDelete = (index) => {
  tableData.value.splice(index, 1)
  if (tableData.value.length === 0) {
    tableData.value.push(getEmptyRow())
  }
}

// 处理图片变化
const handleImageChange = (file, row) => {
  if (!row.images) {
    row.images = []
  }
  row.images.push({
    name: file.name,
    url: URL.createObjectURL(file.raw)
  })
}

// 验证数据
const validateTableData = (data) => {
  if (!data || !data.length) {
    ElMessage.warning('请添加入库数据')
    return false
  }

  const invalidData = data.some(row => {
    // 基础字段验证
    if (!row.name || !row.quantity || !row.unit || !row.weight || !row.arrivalDate || !row.supplier) {
      return true
    }
    
    // 数值验证
    const quantity = Number(row.quantity)
    const weight = Number(row.weight)
    if (isNaN(quantity) || quantity <= 0 || isNaN(weight) || weight <= 0) {
      return true
    }
    
    // 图片验证
    if (!row.images || !row.images.length) {
      return true
    }
    
    return false
  })

  if (invalidData) {
    ElMessage.warning('请完善所有必填信息,并确保数量和重量为正数')
    return false
  }

  return true
}

// 处理保存
const handleSave = async () => {
  try {
    saving.value = true
    
    // 验证数据
    if (!validateTableData(tableData.value)) {
      return
    }
    
    // 获取已有数据
    const storageKey = `${inboundType.value}_inbound_list`
    const existingData = storage.getStorageData(storageKey) || []
    
    // 准备新数据
    const newData = {
      id: Date.now(),
      type: inboundType.value,
      items: tableData.value.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        weight: Number(item.weight),
        images: [...item.images] // 创建图片数组的副本
      })),
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    }
    
    // 保存数据
    existingData.push(newData)
    const success = storage.setStorageData(storageKey, existingData)
    
    if (!success) {
      throw new Error('保存数据失败')
    }
    
    ElMessage.success('保存成功')
    // 重置表格
    tableData.value = [getEmptyRow()]
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error(error.message || '保存失败,请重试')
  } finally {
    saving.value = false
  }
}

// 处理图片上传成功
const handleImageSuccess = (row, response) => {
  try {
    if (!response || !response.url) {
      throw new Error('上传失败:未获取到图片地址')
    }
    
    if (!row.images) {
      row.images = []
    }
    row.images.push(response.url)
  } catch (error) {
    console.error('处理图片上传失败:', error)
    ElMessage.error(error.message || '图片上传失败')
  }
}

// 处理图片上传失败
const handleImageError = (error) => {
  console.error('图片上传失败:', error)
  ElMessage.error('图片上传失败,请重试')
}

// 处理图片删除
const handleImageRemove = (row, index) => {
  try {
    if (!row.images) return
    row.images.splice(index, 1)
  } catch (error) {
    console.error('删除图片失败:', error)
    ElMessage.error('删除图片失败')
  }
}

// 监听入库类型变化
watch(inboundType, () => {
  try {
    loadExistingData()
  } catch (error) {
    console.error('切换类型加载数据失败:', error)
    ElMessage.error('切换类型加载数据失败')
    tableData.value = [getEmptyRow()]
  }
})

// 初始化数据
onMounted(() => {
  loadExistingData()
})

// 表单数据
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const submitLoading = ref(false)
const activeTab = ref('mould')
const productOptions = ref([])

const form = ref({
  date: '',
  type: '',
  items: [],
  remark: ''
})

// 表单验证规则
const rules = {
  date: [{ required: true, message: '请选择入库日期', trigger: 'change' }],
  type: [{ required: true, message: '请选择入库类型', trigger: 'change' }],
  items: [
    { required: true, message: '请添加物料', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (!value || !value.length) {
          callback(new Error('请添加物料'))
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

// 获取产品列表
const getProductList = async () => {
  try {
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

// 处理新增
const handleAdd = () => {
  dialogType.value = 'add'
  form.value = {
    date: new Date().toISOString().split('T')[0],
    type: activeTab.value,
    items: [],
    remark: ''
  }
  dialogVisible.value = true
}

// 处理物料选择变化
const handleProductChange = (productId, row) => {
  const product = productOptions.value.find(item => item.id === productId)
  if (product) {
    row.unit = product.unit
    row.price = product.price
    handleQuantityChange(row)
  }
}

// 处理数量变化
const handleQuantityChange = (row) => {
  row.amount = (Number(row.quantity) || 0) * (Number(row.price) || 0)
}

// 处理价格变化
const handlePriceChange = (row) => {
  row.amount = (Number(row.quantity) || 0) * (Number(row.price) || 0)
}

// 添加物料
const handleAddMaterial = () => {
  form.value.items.push({
    productId: '',
    quantity: 1,
    price: 0,
    amount: 0
  })
}

// 移除物料
const handleRemoveMaterial = (index) => {
  form.value.items.splice(index, 1)
}

// 生成唯一ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    const storageKey = `${form.value.type}_inbound_list`
    const list = storage.getStorageData(storageKey) || []
    
    const newInbound = {
      ...form.value,
      id: generateId(),
      createTime: Date.now()
    }
    
    list.push(newInbound)
    const success = storage.setStorageData(storageKey, list)
    
    if (!success) {
      throw new Error('保存失败')
    }
    
    ElMessage.success('入库成功')
    dialogVisible.value = false
    // 刷新列表
    getInboundList()
  } catch (error) {
    console.error('提交入库单失败:', error)
    ElMessage.error(error.message || '提交失败')
  } finally {
    submitLoading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  getProductList()
})
</script>

<style scoped>
.special-inbound {
  padding: var(--spacing-large);
  background-color: var(--background-color);
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-large);
  background: var(--background-white);
  padding: var(--spacing-base);
  border-radius: var(--border-radius-large);
  box-shadow: var(--box-shadow-light);
}

.page-title {
  font-size: 20px;
  color: var(--text-primary);
  margin: 0;
  font-weight: 600;
  position: relative;
  padding-left: var(--spacing-base);
}

.page-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background: var(--primary-color);
  border-radius: var(--border-radius-small);
}

.content-card {
  background: var(--background-white);
  border-radius: var(--border-radius-large);
  padding: var(--spacing-large);
  box-shadow: var(--box-shadow);
}

.type-selector {
  width: 200px;
}

.option-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-small);
}

.option-icon {
  font-size: 16px;
  color: var(--primary-color);
}

.custom-input {
  transition: all 0.3s ease;
}

.custom-input:hover {
  transform: translateY(-1px);
}

.custom-number-input {
  width: 100% !important;
}

.custom-date-picker {
  width: 100% !important;
}

.custom-upload {
  :deep(.el-upload--picture-card) {
    width: 100px;
    height: 100px;
    line-height: 100px;
    border-radius: var(--border-radius-base);
    border: 1px dashed var(--border-color);
    transition: all 0.3s ease;
  }

  :deep(.el-upload--picture-card:hover) {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: var(--box-shadow-light);
  }

  :deep(.el-upload-list--picture-card .el-upload-list__item) {
    width: 100px;
    height: 100px;
    border-radius: var(--border-radius-base);
  }
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.upload-icon {
  font-size: 20px;
  margin-bottom: var(--spacing-small);
  color: var(--text-secondary);
}

.upload-text {
  font-size: 12px;
  color: var(--text-secondary);
}

.delete-button {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-mini);
  color: var(--danger-color);
  transition: all 0.3s ease;
}

.delete-button:hover {
  transform: translateY(-1px);
  opacity: 0.8;
}

.footer {
  margin-top: var(--spacing-large);
  display: flex;
  justify-content: center;
  gap: var(--spacing-base);
}

.custom-button {
  min-width: 120px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-small);
  font-weight: 500;
  transition: all 0.3s ease;
  border-radius: var(--border-radius-base);
}

.custom-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--box-shadow);
}

.add-button {
  background: var(--primary-color);
  border: none;
}

.add-button:hover {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color) 100%);
}

.save-button {
  background: var(--success-color);
  border: none;
}

.save-button:hover {
  background: linear-gradient(135deg, var(--success-color) 0%, var(--success-color) 100%);
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: var(--border-radius-base);
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: var(--background-color);
  color: var(--text-primary);
  font-weight: 600;
  padding: var(--spacing-base) 0;
}

:deep(.el-table td) {
  padding: var(--spacing-base) 0;
}

:deep(.el-table--border) {
  border-color: var(--border-light);
}

:deep(.el-table--border th), :deep(.el-table--border td) {
  border-right-color: var(--border-light);
}

:deep(.el-table__body tr:hover > td) {
  background-color: var(--primary-light);
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .special-inbound {
    padding: var(--spacing-base);
  }

  .content-card {
    padding: var(--spacing-base);
  }

  .page-title {
    font-size: 18px;
  }

  .custom-button {
    min-width: 100px;
  }

  .type-selector {
    width: 150px;
  }
}

.operation-bar {
  margin-bottom: 20px;
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

.inbound-form {
  max-height: 600px;
  overflow-y: auto;
}
</style> 