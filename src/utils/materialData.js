// 物料数据结构示例
const materialStructure = {
  id: String,           // 物料ID（必需）
  code: String,         // 物料编码（必需）
  name: String,         // 物料名称（必需）
  unit: String,         // 单位（必需）
  price: Number,        // 单价（必需）
  category: String,     // 类别
  currentStock: Number, // 当前库存
  minStock: Number,     // 最小库存
  maxStock: Number,     // 最大库存
  status: String        // 状态
}

// 修改验证函数，减少必需字段
export function validateMaterial(material) {
  if (!material) return false
  
  // 只验证基本必需字段
  const requiredFields = ['id', 'name', 'unit', 'price']
  const isValid = requiredFields.every(field => {
    const value = material[field]
    return value !== null && value !== undefined && String(value).trim() !== ''
  })
  
  if (!isValid) {
    console.log('Material validation failed:', {
      material,
      missingFields: requiredFields.filter(field => !material[field])
    })
  }
  
  return isValid
}

// 修改格式化函数，确保数据完整性
export function formatMaterial(material) {
  if (!material) return null
  
  const formatted = {
    id: material.id || '',
    code: material.code || '',
    name: material.name || '',
    unit: material.unit || '',
    price: Number(material.price) || 0,
    category: material.category || '',
    currentStock: Number(material.currentStock) || 0,
    minStock: Number(material.minStock) || 0,
    maxStock: Number(material.maxStock) || 0,
    status: material.status || 'active'
  }
  
  console.log('Formatted material:', formatted)
  return formatted
} 