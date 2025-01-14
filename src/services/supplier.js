import storage from '../utils/storage';

// 获取供应商列表
export const getSupplierList = async (params = {}) => {
  try {
    // 从本地存储获取供应商列表
    const suppliers = storage.getStorageData(storage.KEYS.SUPPLIERS) || [];
    
    // 根据搜索参数过滤
    let filteredList = [...suppliers];
    if (params.code) {
      filteredList = filteredList.filter(item => 
        item.code.toLowerCase().includes(params.code.toLowerCase())
      );
    }
    if (params.name) {
      filteredList = filteredList.filter(item => 
        item.name.toLowerCase().includes(params.name.toLowerCase())
      );
    }
    if (params.contact) {
      filteredList = filteredList.filter(item => 
        item.contact.toLowerCase().includes(params.contact.toLowerCase())
      );
    }
    if (params.status) {
      filteredList = filteredList.filter(item => 
        item.status === params.status
      );
    }
    
    // 分页处理
    const total = filteredList.length;
    if (params.page && params.limit) {
      const start = (params.page - 1) * params.limit;
      const end = start + params.limit;
      filteredList = filteredList.slice(start, end);
    }
    
    return {
      code: 200,
      data: {
        list: filteredList,
        total
      }
    };
  } catch (error) {
    console.error('获取供应商列表失败:', error);
    throw new Error('获取供应商列表失败');
  }
};

// 创建供应商
export const createSupplier = async (data) => {
  try {
    // 从本地存储获取供应商列表
    const suppliers = storage.getStorageData(storage.KEYS.SUPPLIERS) || [];
    
    // 检查编码是否重复
    const exists = suppliers.some(item => item.code === data.code);
    if (exists) {
      throw new Error('供应商编码已存在');
    }
    
    // 添加新供应商
    const newSupplier = {
      id: Date.now(),
      ...data,
      createTime: new Date().toISOString()
    };
    suppliers.push(newSupplier);
    
    // 保存到本地存储
    storage.setStorageData(storage.KEYS.SUPPLIERS, suppliers);
    
    return {
      code: 200,
      data: newSupplier
    };
  } catch (error) {
    console.error('创建供应商失败:', error);
    throw error;
  }
};

// 更新供应商
export const updateSupplier = async (id, data) => {
  try {
    // 从本地存储获取供应商列表
    const suppliers = storage.getStorageData(storage.KEYS.SUPPLIERS) || [];
    
    // 查找要更新的供应商
    const index = suppliers.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('供应商不存在');
    }
    
    // 检查编码是否重复
    const exists = suppliers.some(item => item.id !== id && item.code === data.code);
    if (exists) {
      throw new Error('供应商编码已存在');
    }
    
    // 更新供应商
    suppliers[index] = {
      ...suppliers[index],
      ...data
    };
    
    // 保存到本地存储
    storage.setStorageData(storage.KEYS.SUPPLIERS, suppliers);
    
    return {
      code: 200,
      data: suppliers[index]
    };
  } catch (error) {
    console.error('更新供应商失败:', error);
    throw error;
  }
};

// 删除供应商
export const deleteSupplier = async (id) => {
  try {
    // 从本地存储获取供应商列表
    const suppliers = storage.getStorageData(storage.KEYS.SUPPLIERS) || [];
    
    // 查找要删除的供应商
    const index = suppliers.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('供应商不存在');
    }
    
    // 删除供应商
    suppliers.splice(index, 1);
    
    // 保存到本地存储
    storage.setStorageData(storage.KEYS.SUPPLIERS, suppliers);
    
    return {
      code: 200,
      message: '删除成功'
    };
  } catch (error) {
    console.error('删除供应商失败:', error);
    throw error;
  }
};

// 批量删除供应商
export const batchDeleteSuppliers = async (ids) => {
  try {
    // 从本地存储获取供应商列表
    const suppliers = storage.getStorageData(storage.KEYS.SUPPLIERS) || [];
    
    // 批量删除供应商
    const newSuppliers = suppliers.filter(item => !ids.includes(item.id));
    
    // 保存到本地存储
    storage.setStorageData(storage.KEYS.SUPPLIERS, newSuppliers);
    
    return {
      code: 200,
      message: '批量删除成功'
    };
  } catch (error) {
    console.error('批量删除供应商失败:', error);
    throw error;
  }
};

export default {
  getSupplierList,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  batchDeleteSuppliers
}; 