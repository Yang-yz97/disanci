// 生成编号
function generateNo(prefix = '') {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${prefix}${year}${month}${day}${random}`
}

// 处理分页
function handlePagination(list, page = 1, limit = 10) {
  const start = (page - 1) * limit
  const end = start + limit
  return {
    list: list.slice(start, end),
    page: Number(page),
    limit: Number(limit)
  }
}

// 模拟数据
const products = [
  {
    id: 1,
    code: 'SP001',
    name: '笔记本电脑',
    category: '电子产品',
    spec: '15.6寸',
    unit: '台',
    price: 4999,
    stock: 50,
    minStock: 10,
    maxStock: 100,
    status: 'active',
    remark: '',
    createTime: '2024-01-15 10:00:00'
  },
  {
    id: 2,
    code: 'SP002',
    name: '打印机',
    category: '电子产品',
    spec: 'A4彩色',
    unit: '台',
    price: 1999,
    stock: 5,
    minStock: 10,
    maxStock: 50,
    status: 'active',
    remark: '',
    createTime: '2024-01-15 10:00:00'
  },
  {
    id: 3,
    code: 'SP003',
    name: '办公桌',
    category: '办公家具',
    spec: '1.4m',
    unit: '张',
    price: 899,
    stock: 0,
    minStock: 5,
    maxStock: 20,
    status: 'active',
    remark: '',
    createTime: '2024-01-15 10:00:00'
  }
]

const customers = [
  {
    id: 1,
    code: 'KH001',
    name: '研发部',
    contact: '张三',
    phone: '13800138001',
    email: 'dev@company.com',
    status: 'active',
    remark: '',
    createTime: '2024-01-15 10:00:00'
  },
  {
    id: 2,
    code: 'KH002',
    name: '市场部',
    contact: '李四',
    phone: '13800138002',
    email: 'market@company.com',
    status: 'active',
    remark: '',
    createTime: '2024-01-15 10:00:00'
  }
]

const suppliers = [
  {
    id: 1,
    code: 'GYS001',
    name: '联想科技',
    contact: '王五',
    phone: '13900139001',
    email: 'lenovo@supplier.com',
    status: 'active',
    remark: '',
    createTime: '2024-01-15 10:00:00'
  },
  {
    id: 2,
    code: 'GYS002',
    name: '惠普科技',
    contact: '赵六',
    phone: '13900139002',
    email: 'hp@supplier.com',
    status: 'active',
    remark: '',
    createTime: '2024-01-15 10:00:00'
  }
]

const inboundList = [
  {
    id: 1,
    code: 'RK202401150001',
    date: '2024-01-15',
    supplierId: 1,
    supplierName: '联想科技',
    items: [
      {
        id: 1,
        productId: 1,
        productName: '笔记本电脑',
        quantity: 10,
        price: 4500,
        amount: 45000
      }
    ],
    totalAmount: 45000,
    remark: '',
    createTime: '2024-01-15 10:00:00'
  }
]

const outboundList = [
  {
    id: 1,
    code: 'CK202401150001',
    date: '2024-01-15',
    customerId: 1,
    customerName: '研发部',
    items: [
      {
        id: 1,
        productId: 1,
        productName: '笔记本电脑',
        quantity: 2,
        price: 4999,
        amount: 9998
      }
    ],
    totalAmount: 9998,
    remark: '',
    createTime: '2024-01-15 10:00:00'
  }
]

// 添加物料
function addProduct(product) {
  const newProduct = {
    ...product,
    id: products.length + 1,
    createTime: new Date().toLocaleString()
  }
  products.push(newProduct)
  saveAllData()
  return newProduct
}

// 更新物料
function updateProduct(id, data) {
  const index = products.findIndex(item => item.id === id)
  if (index === -1) {
    throw new Error('物料不存在')
  }
  products[index] = { ...products[index], ...data }
  saveAllData()
  return products[index]
}

// 删除物料
function deleteProduct(id) {
  const index = products.findIndex(item => item.id === id)
  if (index === -1) {
    throw new Error('物料不存在')
  }
  products.splice(index, 1)
  saveAllData()
}

// 保存所有数据
function saveAllData() {
  try {
    localStorage.setItem('products', JSON.stringify(products))
    localStorage.setItem('customers', JSON.stringify(customers))
    localStorage.setItem('suppliers', JSON.stringify(suppliers))
    localStorage.setItem('inboundList', JSON.stringify(inboundList))
    localStorage.setItem('outboundList', JSON.stringify(outboundList))
  } catch (error) {
    console.error('保存数据失败:', error)
  }
}

// 加载数据
function loadData(key, defaultData) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultData
  } catch (error) {
    console.error(`加载${key}失败:`, error)
    return defaultData
  }
}

// 统一导出
export {
  generateNo,
  handlePagination,
  products,
  customers,
  suppliers,
  inboundList,
  outboundList,
  addProduct,
  updateProduct,
  deleteProduct,
  saveAllData,
  loadData
} 