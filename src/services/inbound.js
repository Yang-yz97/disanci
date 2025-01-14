import storage from '../utils/storage';
const { STORAGE_KEYS, getStorageData, setStorageData } = storage;

// 获取入库单列表
export const getInboundList = (params = {}) => {
  const { page = 1, limit = 10, orderNo, status, startDate, endDate } = params;
  const inbounds = getStorageData(STORAGE_KEYS.INBOUND_ORDERS) || [];
  
  let filteredList = [...inbounds];
  
  // 根据查询条件过滤
  if (orderNo) {
    filteredList = filteredList.filter(item => item.orderNo.includes(orderNo));
  }
  if (status) {
    filteredList = filteredList.filter(item => item.status === status);
  }
  if (startDate && endDate) {
    filteredList = filteredList.filter(item => {
      const createTime = new Date(item.createTime);
      return createTime >= new Date(startDate) && createTime <= new Date(endDate);
    });
  }
  
  // 分页
  const start = (page - 1) * limit;
  const end = start + Number(limit);
  const list = filteredList.slice(start, end);
  
  return Promise.resolve({
    code: 200,
    message: 'success',
    data: {
      list,
      total: filteredList.length
    }
  });
};

// 获取单个入库单
export const getInbound = (id) => {
  const inbounds = getStorageData(STORAGE_KEYS.INBOUND_ORDERS) || [];
  const inbound = inbounds.find(p => p.id === id);
  
  if (!inbound) {
    return Promise.reject({
      code: 404,
      message: `入库单不存在: ${id}`
    });
  }
  
  return Promise.resolve({
    code: 200,
    message: 'success',
    data: inbound
  });
};

// 创建入库单
export const createInbound = (data) => {
  const inbounds = getStorageData(STORAGE_KEYS.INBOUND_ORDERS) || [];
  const { orderNo, supplierId, supplierName, status = 'pending', items = [], remark = '' } = data;
  
  // 验证必填字段
  if (!orderNo || !supplierId || !supplierName || !items.length) {
    return Promise.reject({
      code: 400,
      message: '请填写必要的入库单信息'
    });
  }
  
  // 检查订单号是否重复
  if (inbounds.some(p => p.orderNo === orderNo)) {
    return Promise.reject({
      code: 400,
      message: `入库单号 ${orderNo} 已存在`
    });
  }
  
  // 计算总金额
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const newInbound = {
    id: inbounds.length ? Math.max(...inbounds.map(p => p.id)) + 1 : 1,
    orderNo,
    supplierId,
    supplierName,
    status,
    items,
    totalAmount,
    remark,
    createTime: new Date().toISOString(),
    createBy: 'admin'
  };
  
  inbounds.push(newInbound);
  setStorageData(STORAGE_KEYS.INBOUND_ORDERS, inbounds);
  
  return Promise.resolve({
    code: 200,
    message: 'success',
    data: newInbound
  });
};

// 更新入库单
export const updateInbound = (id, data) => {
  const inbounds = getStorageData(STORAGE_KEYS.INBOUND_ORDERS) || [];
  const index = inbounds.findIndex(p => p.id === id);
  
  if (index === -1) {
    return Promise.reject({
      code: 404,
      message: `入库单不存在: ${id}`
    });
  }
  
  const { orderNo, supplierId, supplierName, status, items = [], remark } = data;
  
  // 验证必填字段
  if (!orderNo || !supplierId || !supplierName || !items.length) {
    return Promise.reject({
      code: 400,
      message: '请填写必要的入库单信息'
    });
  }
  
  // 检查订单号是否重复（排除自身）
  if (inbounds.some(p => p.orderNo === orderNo && p.id !== id)) {
    return Promise.reject({
      code: 400,
      message: `入库单号 ${orderNo} 已存在`
    });
  }
  
  // 计算总金额
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const updatedInbound = {
    ...inbounds[index],
    orderNo,
    supplierId,
    supplierName,
    status: status || 'pending',
    items,
    totalAmount,
    remark: remark || ''
  };
  
  inbounds[index] = updatedInbound;
  setStorageData(STORAGE_KEYS.INBOUND_ORDERS, inbounds);
  
  return Promise.resolve({
    code: 200,
    message: 'success',
    data: updatedInbound
  });
};

// 删除入库单
export const deleteInbound = (id) => {
  const inbounds = getStorageData(STORAGE_KEYS.INBOUND_ORDERS) || [];
  const index = inbounds.findIndex(p => p.id === id);
  
  if (index === -1) {
    return Promise.reject({
      code: 404,
      message: `入库单不存在: ${id}`
    });
  }
  
  inbounds.splice(index, 1);
  setStorageData(STORAGE_KEYS.INBOUND_ORDERS, inbounds);
  
  return Promise.resolve({
    code: 200,
    message: 'success'
  });
};

// 批量删除入库单
export const batchDeleteInbounds = (ids) => {
  if (!Array.isArray(ids) || !ids.length) {
    return Promise.reject({
      code: 400,
      message: '请选择要删除的入库单'
    });
  }
  
  const inbounds = getStorageData(STORAGE_KEYS.INBOUND_ORDERS) || [];
  const beforeCount = inbounds.length;
  const numericIds = ids.map(Number);
  
  const newInbounds = inbounds.filter(p => !numericIds.includes(p.id));
  setStorageData(STORAGE_KEYS.INBOUND_ORDERS, newInbounds);
  
  const deletedCount = beforeCount - newInbounds.length;
  
  return Promise.resolve({
    code: 200,
    message: 'success',
    data: { deletedCount }
  });
};

// 获取供应商列表
export const getSupplierList = () => {
  const suppliers = getStorageData(STORAGE_KEYS.SUPPLIERS) || [];
  return Promise.resolve({
    code: 200,
    message: 'success',
    data: suppliers
  });
};

// 获取产品列表
export const getProductList = () => {
  const products = getStorageData(STORAGE_KEYS.PRODUCTS) || [];
  return Promise.resolve({
    code: 200,
    message: 'success',
    data: products
  });
};

export default {
  getInboundList,
  getInbound,
  createInbound,
  updateInbound,
  deleteInbound,
  batchDeleteInbounds,
  getSupplierList,
  getProductList
}; 