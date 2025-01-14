const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// 数据文件路径
const DATA_FILE = path.join(__dirname, '../data/suppliers.json');

// 确保数据目录存在
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// 读取供应商数据
let suppliers = [];
try {
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    suppliers = JSON.parse(data);
  } else {
    // 初始数据
    suppliers = [
      {
        id: 1,
        code: 'GYS001',
        name: '联想科技',
        contact: '张三',
        phone: '13900139000',
        status: 'active',
        remark: '电脑供应商',
        createTime: new Date('2024-01-01').toISOString()
      },
      {
        id: 2,
        code: 'GYS002',
        name: '惠普科技',
        contact: '李四',
        phone: '13900139001',
        status: 'active',
        remark: '打印机供应商',
        createTime: new Date('2024-01-02').toISOString()
      }
    ];
    // 保存初始数据
    fs.writeFileSync(DATA_FILE, JSON.stringify(suppliers, null, 2));
  }
} catch (error) {
  console.error('Error loading suppliers data:', error);
}

// 保存供应商数据
const saveSuppliers = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(suppliers, null, 2));
  } catch (error) {
    console.error('Error saving suppliers data:', error);
  }
};

// 获取供应商列表
router.get('/list', (req, res) => {
  console.log('GET /list - Query:', req.query);
  const { page = 1, limit = 10, code, name, status } = req.query;
  
  let filteredList = [...suppliers];
  
  // 根据查询条件过滤
  if (code) {
    filteredList = filteredList.filter(item => item.code.includes(code));
  }
  if (name) {
    filteredList = filteredList.filter(item => item.name.includes(name));
  }
  if (status) {
    filteredList = filteredList.filter(item => item.status === status);
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

// 获取单个供应商
router.get('/:id', (req, res) => {
  console.log('GET /:id - Params:', req.params);
  const id = Number(req.params.id);
  const supplier = suppliers.find(s => s.id === id);
  if (!supplier) {
    console.log('GET /:id - Supplier not found:', id);
    return res.status(404).json({
      code: 404,
      message: `供应商不存在: ${id}`
    });
  }
  console.log('GET /:id - Found supplier:', supplier);
  res.json({
    code: 200,
    message: 'success',
    data: supplier
  });
});

// 创建供应商
router.post('/', (req, res) => {
  console.log('POST / - Body:', req.body);
  const { code, name, contact, phone, status = 'active', remark = '' } = req.body;

  // 验证必填字段
  if (!code || !name || !contact || !phone) {
    return res.status(400).json({
      code: 400,
      message: '请填写必要的供应商信息'
    });
  }

  // 检查编号是否重复
  if (suppliers.some(s => s.code === code)) {
    return res.status(400).json({
      code: 400,
      message: `供应商编号 ${code} 已存在`
    });
  }

  const newSupplier = {
    id: suppliers.length ? Math.max(...suppliers.map(s => s.id)) + 1 : 1,
    code,
    name,
    contact,
    phone,
    status,
    remark,
    createTime: new Date().toISOString()
  };

  suppliers.push(newSupplier);
  saveSuppliers(); // 保存更新后的数据
  console.log('POST / - Created supplier:', newSupplier);
  res.json({
    code: 200,
    message: 'success',
    data: newSupplier
  });
});

// 更新供应商
router.put('/:id', (req, res) => {
  console.log('PUT /:id - Params:', req.params, 'Body:', req.body);
  const id = Number(req.params.id);
  const index = suppliers.findIndex(s => s.id === id);
  
  if (index === -1) {
    console.log('PUT /:id - Supplier not found:', id);
    return res.status(404).json({
      code: 404,
      message: `供应商不存在: ${id}`
    });
  }

  const { code, name, contact, phone, status, remark } = req.body;

  // 验证必填字段
  if (!code || !name || !contact || !phone) {
    return res.status(400).json({
      code: 400,
      message: '请填写必要的供应商信息'
    });
  }

  // 检查编号是否重复（排除自身）
  if (suppliers.some(s => s.code === code && s.id !== id)) {
    return res.status(400).json({
      code: 400,
      message: `供应商编号 ${code} 已存在`
    });
  }

  const updatedSupplier = {
    ...suppliers[index],
    code,
    name,
    contact,
    phone,
    status: status || 'active',
    remark: remark || '',
    id
  };

  suppliers[index] = updatedSupplier;
  saveSuppliers(); // 保存更新后的数据
  console.log('PUT /:id - Updated supplier:', updatedSupplier);
  res.json({
    code: 200,
    message: 'success',
    data: updatedSupplier
  });
});

// 删除供应商
router.delete('/:id', (req, res) => {
  console.log('DELETE /:id - Params:', req.params);
  const id = Number(req.params.id);
  const index = suppliers.findIndex(s => s.id === id);
  
  if (index === -1) {
    console.log('DELETE /:id - Supplier not found:', id);
    return res.status(404).json({
      code: 404,
      message: `供应商不存在: ${id}`
    });
  }

  const deleted = suppliers.splice(index, 1)[0];
  saveSuppliers(); // 保存更新后的数据
  console.log('DELETE /:id - Deleted supplier:', deleted);
  res.json({
    code: 200,
    message: 'success'
  });
});

// 批量删除供应商
router.post('/batch/delete', (req, res) => {
  console.log('POST /batch/delete - Body:', req.body);
  const { ids } = req.body;
  
  if (!Array.isArray(ids) || !ids.length) {
    console.log('POST /batch/delete - Invalid request:', req.body);
    return res.status(400).json({
      code: 400,
      message: '请选择要删除的供应商'
    });
  }

  const beforeCount = suppliers.length;
  const numericIds = ids.map(Number);
  suppliers = suppliers.filter(s => !numericIds.includes(s.id));
  const deletedCount = beforeCount - suppliers.length;

  saveSuppliers(); // 保存更新后的数据
  console.log('POST /batch/delete - Deleted count:', deletedCount);
  res.json({
    code: 200,
    message: 'success',
    data: { deletedCount }
  });
});

module.exports = router; 