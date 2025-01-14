const express = require('express');
const router = express.Router();

// 模拟数据库
let suppliers = [
  {
    id: 1,
    code: 'GYS001',
    name: '联想科技',
    contact: '张三',
    phone: '13900139000',
    status: 'active',
    remark: '电脑供应商',
    createTime: new Date('2024-01-01').toISOString()
  }
];

// 获取供应商列表
router.get('/list', (req, res) => {
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
  
  res.json({
    code: 200,
    message: '获取成功',
    data: {
      list,
      total: filteredList.length
    }
  });
});

// 获取单个供应商
router.get('/:id', (req, res) => {
  const supplier = suppliers.find(s => s.id === Number(req.params.id));
  if (!supplier) {
    return res.status(404).json({
      code: 404,
      message: `供应商不存在: ${req.params.id}`
    });
  }
  res.json({
    code: 200,
    message: '获取成功',
    data: supplier
  });
});

// 创建供应商
router.post('/', (req, res) => {
  const newSupplier = {
    ...req.body,
    id: suppliers.length ? Math.max(...suppliers.map(s => s.id)) + 1 : 1,
    createTime: new Date().toISOString()
  };
  suppliers.push(newSupplier);
  res.json({
    code: 200,
    message: '创建成功',
    data: newSupplier
  });
});

// 更新供应商
router.put('/:id', (req, res) => {
  const index = suppliers.findIndex(s => s.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({
      code: 404,
      message: `供应商不存在: ${req.params.id}`
    });
  }
  
  suppliers[index] = {
    ...suppliers[index],
    ...req.body,
    id: Number(req.params.id)
  };
  
  res.json({
    code: 200,
    message: '更新成功',
    data: suppliers[index]
  });
});

// 删除供应商
router.delete('/:id', (req, res) => {
  const index = suppliers.findIndex(s => s.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({
      code: 404,
      message: `供应商不存在: ${req.params.id}`
    });
  }
  
  suppliers.splice(index, 1);
  res.json({
    code: 200,
    message: '删除成功'
  });
});

// 批量删除供应商
router.post('/batch/delete', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || !ids.length) {
    return res.status(400).json({
      code: 400,
      message: '请选择要删除的供应商'
    });
  }
  
  suppliers = suppliers.filter(s => !ids.includes(s.id));
  res.json({
    code: 200,
    message: '批量删除成功'
  });
});

module.exports = router; 