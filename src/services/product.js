import storage from '../utils/storage';
const { STORAGE_KEYS, getStorageData, setStorageData } = storage;

// 获取产品列表
export const getProductList = (params = {}) => {
  const { page = 1, limit = 10, code, name, category, status } = params;
  const products = getStorageData(STORAGE_KEYS.PRODUCTS) || [];
  
  let filteredList = [...products];
  
  // 根据查询条件过滤
  if (code) {
    filteredList = filteredList.filter(item => item.code.includes(code));
  }
  if (name) {
    filteredList = filteredList.filter(item => item.name.includes(name));
  }
  if (category) {
    filteredList = filteredList.filter(item => item.category === category);
  }
  if (status) {
    filteredList = filteredList.filter(item => item.status === status);
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

// 获取单个产品
export const getProduct = (id) => {
  const products = getStorageData(STORAGE_KEYS.PRODUCTS) || [];
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return Promise.reject({
      code: 404,
      message: `产品不存在: ${id}`
    });
  }
  
  return Promise.resolve({
    code: 200,
    message: 'success',
    data: product
  });
};

// 创建产品
export const createProduct = (data) => {
  const products = getStorageData(STORAGE_KEYS.PRODUCTS) || [];
  const { code, name, category, unit, price, status = 'active', remark = '' } = data;
  
  // 验证必填字段
  if (!code || !name || !category || !unit || !price) {
    return Promise.reject({
      code: 400,
      message: '请填写必要的产品信息'
    });
  }
  
  // 检查编号是否重复
  if (products.some(p => p.code === code)) {
    return Promise.reject({
      code: 400,
      message: `产品编号 ${code} 已存在`
    });
  }
  
  const newProduct = {
    id: products.length ? Math.max(...products.map(p => p.id)) + 1 : 1,
    code,
    name,
    category,
    unit,
    price: Number(price),
    status,
    remark,
    createTime: new Date().toISOString()
  };
  
  products.push(newProduct);
  setStorageData(STORAGE_KEYS.PRODUCTS, products);
  
  return Promise.resolve({
    code: 200,
    message: 'success',
    data: newProduct
  });
};

// 更新产品
export const updateProduct = (id, data) => {
  const products = getStorageData(STORAGE_KEYS.PRODUCTS) || [];
  const index = products.findIndex(p => p.id === id);
  
  if (index === -1) {
    return Promise.reject({
      code: 404,
      message: `产品不存在: ${id}`
    });
  }
  
  const { code, name, category, unit, price, status, remark } = data;
  
  // 验证必填字段
  if (!code || !name || !category || !unit || !price) {
    return Promise.reject({
      code: 400,
      message: '请填写必要的产品信息'
    });
  }
  
  // 检查编号是否重复（排除自身）
  if (products.some(p => p.code === code && p.id !== id)) {
    return Promise.reject({
      code: 400,
      message: `产品编号 ${code} 已存在`
    });
  }
  
  const updatedProduct = {
    ...products[index],
    code,
    name,
    category,
    unit,
    price: Number(price),
    status: status || 'active',
    remark: remark || ''
  };
  
  products[index] = updatedProduct;
  setStorageData(STORAGE_KEYS.PRODUCTS, products);
  
  return Promise.resolve({
    code: 200,
    message: 'success',
    data: updatedProduct
  });
};

// 删除产品
export const deleteProduct = (id) => {
  const products = getStorageData(STORAGE_KEYS.PRODUCTS) || [];
  const index = products.findIndex(p => p.id === id);
  
  if (index === -1) {
    return Promise.reject({
      code: 404,
      message: `产品不存在: ${id}`
    });
  }
  
  products.splice(index, 1);
  setStorageData(STORAGE_KEYS.PRODUCTS, products);
  
  return Promise.resolve({
    code: 200,
    message: 'success'
  });
};

// 批量删除产品
export const batchDeleteProducts = (ids) => {
  if (!Array.isArray(ids) || !ids.length) {
    return Promise.reject({
      code: 400,
      message: '请选择要删除的产品'
    });
  }
  
  const products = getStorageData(STORAGE_KEYS.PRODUCTS) || [];
  const beforeCount = products.length;
  const numericIds = ids.map(Number);
  
  const newProducts = products.filter(p => !numericIds.includes(p.id));
  setStorageData(STORAGE_KEYS.PRODUCTS, newProducts);
  
  const deletedCount = beforeCount - newProducts.length;
  
  return Promise.resolve({
    code: 200,
    message: 'success',
    data: { deletedCount }
  });
};

export default {
  getProductList,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  batchDeleteProducts
}; 