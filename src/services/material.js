import storage from '../utils/storage'

// 获取物料列表
export const getMaterialList = async (params = {}) => {
  try {
    // 从本地存储获取物料列表
    const materials = storage.getStorageData(storage.KEYS.PRODUCTS) || []
    
    // 根据搜索参数过滤
    let filteredList = [...materials]
    if (params.code) {
      filteredList = filteredList.filter(item => 
        item.code.toLowerCase().includes(params.code.toLowerCase())
      )
    }
    if (params.name) {
      filteredList = filteredList.filter(item => 
        item.name.toLowerCase().includes(params.name.toLowerCase())
      )
    }
    if (params.category) {
      filteredList = filteredList.filter(item => 
        item.category === params.category
      )
    }
    
    // 分页处理
    const total = filteredList.length
    if (params.page && params.limit) {
      const start = (params.page - 1) * params.limit
      const end = start + params.limit
      filteredList = filteredList.slice(start, end)
    }
    
    return {
      code: 200,
      data: {
        list: filteredList,
        total
      }
    }
  } catch (error) {
    console.error('获取物料列表失败:', error)
    throw new Error('获取物料列表失败')
  }
}

// 创建物料
export const createMaterial = async (data) => {
  try {
    // 从本地存储获取物料列表
    const materials = storage.getStorageData(storage.KEYS.PRODUCTS) || []
    
    // 检查编码是否重复
    const exists = materials.some(item => item.code === data.code)
    if (exists) {
      throw new Error('物料编码已存在')
    }
    
    // 添加新物料
    const newMaterial = {
      id: Date.now(),
      ...data,
      createTime: new Date().toISOString()
    }
    materials.push(newMaterial)
    
    // 保存到本地存储
    storage.setStorageData(storage.KEYS.PRODUCTS, materials)
    
    return {
      code: 200,
      data: newMaterial
    }
  } catch (error) {
    console.error('创建物料失败:', error)
    throw error
  }
}

// 更新物料
export const updateMaterial = async (id, data) => {
  try {
    // 从本地存储获取物料列表
    const materials = storage.getStorageData(storage.KEYS.PRODUCTS) || []
    
    // 查找要更新的物料
    const index = materials.findIndex(item => item.id === id)
    if (index === -1) {
      throw new Error('物料不存在')
    }
    
    // 检查编码是否重复
    const exists = materials.some(item => item.id !== id && item.code === data.code)
    if (exists) {
      throw new Error('物料编码已存在')
    }
    
    // 更新物料
    materials[index] = {
      ...materials[index],
      ...data
    }
    
    // 保存到本地存储
    storage.setStorageData(storage.KEYS.PRODUCTS, materials)
    
    return {
      code: 200,
      data: materials[index]
    }
  } catch (error) {
    console.error('更新物料失败:', error)
    throw error
  }
}

// 删除物料
export const deleteMaterial = async (id) => {
  try {
    // 从本地存储获取物料列表
    const materials = storage.getStorageData(storage.KEYS.PRODUCTS) || []
    
    // 查找要删除的物料
    const index = materials.findIndex(item => item.id === id)
    if (index === -1) {
      throw new Error('物料不存在')
    }
    
    // 删除物料
    materials.splice(index, 1)
    
    // 保存到本地存储
    storage.setStorageData(storage.KEYS.PRODUCTS, materials)
    
    return {
      code: 200,
      message: '删除成功'
    }
  } catch (error) {
    console.error('删除物料失败:', error)
    throw error
  }
}

// 批量删除物料
export const batchDeleteMaterials = async (ids) => {
  try {
    // 从本地存储获取物料列表
    const materials = storage.getStorageData(storage.KEYS.PRODUCTS) || []
    
    // 批量删除物料
    const newMaterials = materials.filter(item => !ids.includes(item.id))
    
    // 保存到本地存储
    storage.setStorageData(storage.KEYS.PRODUCTS, newMaterials)
    
    return {
      code: 200,
      message: '批量删除成功'
    }
  } catch (error) {
    console.error('批量删除物料失败:', error)
    throw error
  }
}

export default {
  getMaterialList,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  batchDeleteMaterials
} 