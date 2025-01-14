const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// 数据文件路径
const DATA_FILE = path.join(__dirname, '../data/inbound.json');

// 确保数据目录存在
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// 读取入库单数据
let inboundOrders = [];
try {
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    inboundOrders = JSON.parse(data);
  } else {
    // 初始数据
    inboundOrders = [
      {
        id: 1,
        orderNo: 'RK202401120001',
        supplierId: 1,
        supplierName: '联想科技',
        status: 'pending',
        remark: '测试入库单',
        items: [
          {
            id: 1,
            productId: 1,
            productName: 'ThinkPad X1',
            quantity: 10,
            price: 9999,
            total: 99990
          }
        ],
        totalAmount: 99990,
        createTime: new Date('2024-01-12').toISOString(),
        createBy: 'admin'
      }
    ];
    // 保存初始数据
    fs.writeFileSync(DATA_FILE, JSON.stringify(inboundOrders, null, 2));
  }
} catch (error) {
  console.error('Error loading inbound orders data:', error);
}

// 保存入库单数据
const saveInboundOrders = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(inboundOrders, null, 2));
  } catch (error) {
    console.error('Error saving inbound orders data:', error);
  }
};

// 获取入库单列表
router.get('/list', (req, res) => {
  console.log('GET /list - Query:', req.query);
  const { page = 1, limit = 10, orderNo, supplierName, status, startDate, endDate } = req.query;
  
  let filteredList = [...inboundOrders];
  
  // 根据查询条件过滤
  if (orderNo) {
    filteredList = filteredList.filter(item => item.orderNo.includes(orderNo));
  }
  if (supplierName) {
    filteredList = filteredList.filter(item => item.supplierName.includes(supplierName));
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
  
  console.log('GET /list - Response:', { total: filteredList.length, count: list.length });
  res.json({
    code: 200,
    message: 'success',
    data: {
      list,
      total: filteredList.length
    }
  });
});

// 获取单个入库单
router.get('/:id', (req, res) => {
  console.log('GET /:id - Params:', req.params);
  const id = Number(req.params.id);
  const order = inboundOrders.find(o => o.id === id);
  
  if (!order) {
    console.log('GET /:id - Order not found:', id);
    return res.status(404).json({
      code: 404,
      message: `入库单不存在: ${id}`
    });
  }
  
  console.log('GET /:id - Found order:', order);
  res.json({
    code: 200,
    message: 'success',
    data: order
  });
});

// 创建入库单
router.post('/', (req, res) => {
  console.log('POST / - Body:', req.body);
  const { supplierId, supplierName, items = [], remark = '' } = req.body;
  
  // 验证必填字段
  if (!supplierId || !supplierName || !items.length) {
    return res.status(400).json({
      code: 400,
      message: '请填写必要的入库单信息'
    });
  }
  
  // 生成入库单号
  const date = new Date();
  const orderNo = `RK${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${String(inboundOrders.length + 1).padStart(4, '0')}`;
  
  // 计算总金额
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const newOrder = {
    id: inboundOrders.length ? Math.max(...inboundOrders.map(o => o.id)) + 1 : 1,
    orderNo,
    supplierId,
    supplierName,
    status: 'pending',
    remark,
    items: items.map((item, index) => ({
      id: index + 1,
      ...item,
      total: item.price * item.quantity
    })),
    totalAmount,
    createTime: new Date().toISOString(),
    createBy: 'admin' // 应该从登录用户中获取
  };
  
  inboundOrders.push(newOrder);
  saveInboundOrders(); // 保存更新后的数据
  console.log('POST / - Created order:', newOrder);
  res.json({
    code: 200,
    message: 'success',
    data: newOrder
  });
});

// 更新入库单
router.put('/:id', (req, res) => {
  console.log('PUT /:id - Params:', req.params, 'Body:', req.body);
  const id = Number(req.params.id);
  const index = inboundOrders.findIndex(o => o.id === id);
  
  if (index === -1) {
    console.log('PUT /:id - Order not found:', id);
    return res.status(404).json({
      code: 404,
      message: `入库单不存在: ${id}`
    });
  }
  
  const { supplierId, supplierName, items = [], remark } = req.body;
  
  // 验证必填字段
  if (!supplierId || !supplierName || !items.length) {
    return res.status(400).json({
      code: 400,
      message: '请填写必要的入库单信息'
    });
  }
  
  // 计算总金额
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const updatedOrder = {
    ...inboundOrders[index],
    supplierId,
    supplierName,
    remark: remark || '',
    items: items.map((item, idx) => ({
      id: idx + 1,
      ...item,
      total: item.price * item.quantity
    })),
    totalAmount
  };
  
  inboundOrders[index] = updatedOrder;
  saveInboundOrders(); // 保存更新后的数据
  console.log('PUT /:id - Updated order:', updatedOrder);
  res.json({
    code: 200,
    message: 'success',
    data: updatedOrder
  });
});

// 删除入库单
router.delete('/:id', (req, res) => {
  console.log('DELETE /:id - Params:', req.params);
  const id = Number(req.params.id);
  const index = inboundOrders.findIndex(o => o.id === id);
  
  if (index === -1) {
    console.log('DELETE /:id - Order not found:', id);
    return res.status(404).json({
      code: 404,
      message: `入库单不存在: ${id}`
    });
  }
  
  // 只能删除待处理的入库单
  if (inboundOrders[index].status !== 'pending') {
    return res.status(400).json({
      code: 400,
      message: '只能删除待处理的入库单'
    });
  }
  
  const deleted = inboundOrders.splice(index, 1)[0];
  saveInboundOrders(); // 保存更新后的数据
  console.log('DELETE /:id - Deleted order:', deleted);
  res.json({
    code: 200,
    message: 'success'
  });
});

// 批量删除入库单
router.post('/batch/delete', (req, res) => {
  console.log('POST /batch/delete - Body:', req.body);
  const { ids } = req.body;
  
  if (!Array.isArray(ids) || !ids.length) {
    console.log('POST /batch/delete - Invalid request:', req.body);
    return res.status(400).json({
      code: 400,
      message: '请选择要删除的入库单'
    });
  }

  const beforeCount = inboundOrders.length;
  const numericIds = ids.map(Number);
  
  // 检查是否所有要删除的入库单都是待处理状态
  const invalidOrders = inboundOrders.filter(o => 
    numericIds.includes(o.id) && o.status !== 'pending'
  );
  
  if (invalidOrders.length) {
    return res.status(400).json({
      code: 400,
      message: '只能删除待处理的入库单'
    });
  }
  
  inboundOrders = inboundOrders.filter(o => !numericIds.includes(o.id));
  saveInboundOrders(); // 保存更新后的数据
  
  const deletedCount = beforeCount - inboundOrders.length;
  console.log('POST /batch/delete - Deleted count:', deletedCount);
  res.json({
    code: 200,
    message: 'success',
    data: { deletedCount }
  });
});

module.exports = router; 