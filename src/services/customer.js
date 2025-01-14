import storage from '../utils/storage';

// 获取团队列表
export const getCustomerList = async (params = {}) => {
  try {
    // 从本地存储获取团队列表
    const teams = storage.getStorageData(storage.KEYS.TEAMS) || [];
    
    // 根据搜索参数过滤
    let filteredList = [...teams];
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
    console.error('获取团队列表失败:', error);
    throw new Error('获取团队列表失败');
  }
};

// 创建团队
export const createCustomer = async (data) => {
  try {
    // 从本地存储获取团队列表
    const teams = storage.getStorageData(storage.KEYS.TEAMS) || [];
    
    // 检查编码是否重复
    const exists = teams.some(item => item.code === data.code);
    if (exists) {
      throw new Error('团队编码已存在');
    }
    
    // 添加新团队
    const newTeam = {
      id: Date.now(),
      ...data,
      createTime: new Date().toISOString()
    };
    teams.push(newTeam);
    
    // 保存到本地存储
    storage.setStorageData(storage.KEYS.TEAMS, teams);
    
    return {
      code: 200,
      data: newTeam
    };
  } catch (error) {
    console.error('创建团队失败:', error);
    throw error;
  }
};

// 更新团队
export const updateCustomer = async (id, data) => {
  try {
    // 从本地存储获取团队列表
    const teams = storage.getStorageData(storage.KEYS.TEAMS) || [];
    
    // 查找要更新的团队
    const index = teams.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('团队不存在');
    }
    
    // 检查编码是否重复
    const exists = teams.some(item => item.id !== id && item.code === data.code);
    if (exists) {
      throw new Error('团队编码已存在');
    }
    
    // 更新团队
    teams[index] = {
      ...teams[index],
      ...data
    };
    
    // 保存到本地存储
    storage.setStorageData(storage.KEYS.TEAMS, teams);
    
    return {
      code: 200,
      data: teams[index]
    };
  } catch (error) {
    console.error('更新团队失败:', error);
    throw error;
  }
};

// 删除团队
export const deleteCustomer = async (id) => {
  try {
    // 从本地存储获取团队列表
    const teams = storage.getStorageData(storage.KEYS.TEAMS) || [];
    
    // 查找要删除的团队
    const index = teams.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('团队不存在');
    }
    
    // 删除团队
    teams.splice(index, 1);
    
    // 保存到本地存储
    storage.setStorageData(storage.KEYS.TEAMS, teams);
    
    return {
      code: 200,
      message: '删除成功'
    };
  } catch (error) {
    console.error('删除团队失败:', error);
    throw error;
  }
};

// 批量删除团队
export const batchDeleteCustomers = async (ids) => {
  try {
    // 从本地存储获取团队列表
    const teams = storage.getStorageData(storage.KEYS.TEAMS) || [];
    
    // 批量删除团队
    const newTeams = teams.filter(item => !ids.includes(item.id));
    
    // 保存到本地存储
    storage.setStorageData(storage.KEYS.TEAMS, newTeams);
    
    return {
      code: 200,
      message: '批量删除成功'
    };
  } catch (error) {
    console.error('批量删除团队失败:', error);
    throw error;
  }
};

export default {
  getCustomerList,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  batchDeleteCustomers
}; 