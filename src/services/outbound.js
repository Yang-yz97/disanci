import storage from '../utils/storage';

// 获取出库单列表
export const getOutboundList = async (params = {}) => {
  try {
    // 从本地存储获取出库单列表
    const outbounds = storage.getStorageData(storage.KEYS.OUTBOUND_ORDERS) || [];
    
    // 根据搜索参数过滤
    let filteredList = [...outbounds];
    if (params.code) {
      filteredList = filteredList.filter(item => 
        item.code.toLowerCase().includes(params.code.toLowerCase())
      );
    }
    if (params.dateRange?.length === 2) {
      const [startDate, endDate] = params.dateRange;
      filteredList = filteredList.filter(item => 
        item.date >= startDate && item.date <= endDate
      );
    }
    if (params.teamId) {
      filteredList = filteredList.filter(item => 
        item.teamId === params.teamId
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
    console.error('获取出库单列表失败:', error);
    throw new Error('获取出库单列表失败');
  }
};

// 获取团队列表
export const getCustomerList = async () => {
  try {
    // 从本地存储获取团队列表
    const teams = storage.getStorageData(storage.KEYS.TEAMS) || [];
    return {
      code: 200,
      data: teams
    };
  } catch (error) {
    console.error('获取团队列表失败:', error);
    throw new Error('获取团队列表失败');
  }
};

// 获取物料列表
export const getProductList = async () => {
  try {
    // 从本地存储获取物料列表
    const products = storage.getStorageData(storage.KEYS.PRODUCTS) || [];
    return {
      code: 200,
      data: products
    };
  } catch (error) {
    console.error('获取物料列表失败:', error);
    throw new Error('获取物料列表失败');
  }
};

// 创建出库单
export const createOutbound = async (data) => {
  try {
    // 从本地存储获取出库单列表
    const outbounds = storage.getStorageData(storage.KEYS.OUTBOUND_ORDERS) || [];
    
    // 生成出库单号
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const code = `CK${year}${month}${day}${random}`;
    
    // 添加新出库单
    const newOutbound = {
      id: Date.now(),
      code,
      ...data,
      createTime: new Date().toISOString()
    };
    outbounds.push(newOutbound);
    
    // 保存到本地存储
    storage.setStorageData(storage.KEYS.OUTBOUND_ORDERS, outbounds);
    
    return {
      code: 200,
      data: newOutbound
    };
  } catch (error) {
    console.error('创建出库单失败:', error);
    throw error;
  }
};

// 更新出库单
export const updateOutbound = async (id, data) => {
  try {
    // 从本地存储获取出库单列表
    const outbounds = storage.getStorageData(storage.KEYS.OUTBOUND_ORDERS) || [];
    
    // 查找要更新的出库单
    const index = outbounds.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('出库单不存在');
    }
    
    // 更新出库单
    outbounds[index] = {
      ...outbounds[index],
      ...data
    };
    
    // 保存到本地存储
    storage.setStorageData(storage.KEYS.OUTBOUND_ORDERS, outbounds);
    
    return {
      code: 200,
      data: outbounds[index]
    };
  } catch (error) {
    console.error('更新出库单失败:', error);
    throw error;
  }
};

// 删除出库单
export const deleteOutbound = async (id) => {
  try {
    // 从本地存储获取出库单列表
    const outbounds = storage.getStorageData(storage.KEYS.OUTBOUND_ORDERS) || [];
    
    // 查找要删除的出库单
    const index = outbounds.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('出库单不存在');
    }
    
    // 删除出库单
    outbounds.splice(index, 1);
    
    // 保存到本地存储
    storage.setStorageData(storage.KEYS.OUTBOUND_ORDERS, outbounds);
    
    return {
      code: 200,
      message: '删除成功'
    };
  } catch (error) {
    console.error('删除出库单失败:', error);
    throw error;
  }
};

// 批量删除出库单
export const batchDeleteOutbounds = async (ids) => {
  try {
    // 从本地存储获取出库单列表
    const outbounds = storage.getStorageData(storage.KEYS.OUTBOUND_ORDERS) || [];
    
    // 批量删除出库单
    const newOutbounds = outbounds.filter(item => !ids.includes(item.id));
    
    // 保存到本地存储
    storage.setStorageData(storage.KEYS.OUTBOUND_ORDERS, newOutbounds);
    
    return {
      code: 200,
      message: '批量删除成功'
    };
  } catch (error) {
    console.error('批量删除出库单失败:', error);
    throw error;
  }
};

export default {
  getOutboundList,
  getCustomerList,
  getProductList,
  createOutbound,
  updateOutbound,
  deleteOutbound,
  batchDeleteOutbounds
}; 