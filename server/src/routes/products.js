const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// 获取商品列表
router.get('/list', async (req, res) => {
  console.log('接收到获取商品列表请求，参数:', req.query);
  try {
    const { page = 1, limit = 10, code, name, category } = req.query;
    const query = {};
    
    if (code) query.code = new RegExp(code, 'i');
    if (name) query.name = new RegExp(name, 'i');
    if (category) query.category = category;
    
    console.log('构建的查询条件:', query);
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);
    
    console.log('分页参数:', { skip, limit: limitNum });
    
    const list = await Product.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });
    
    const total = await Product.countDocuments(query);
    
    console.log('查询结果:', { 
      total, 
      listLength: list.length,
      firstItem: list[0],
      query: JSON.stringify(query)
    });
    
    res.json({
      code: 200,
      data: {
        list,
        total,
        page: parseInt(page),
        limit: limitNum
      },
      message: '获取商品列表成功'
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取商品列表失败: ' + error.message
    });
  }
});

// 创建商品
router.post('/', async (req, res) => {
  console.log('接收到创建商品请求，数据:', req.body);
  try {
    // 检查商品编码是否已存在
    const existingProduct = await Product.findOne({ code: req.body.code });
    if (existingProduct) {
      console.log('商品编码已存在:', req.body.code);
      return res.status(400).json({
        code: 400,
        message: '商品编码已存在'
      });
    }

    const product = new Product(req.body);
    await product.save();
    
    console.log('商品创建成功:', product);
    
    res.json({
      code: 200,
      data: product,
      message: '创建成功'
    });
  } catch (error) {
    console.error('创建商品失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建商品失败: ' + error.message
    });
  }
});

// 更新商品
router.put('/:id', async (req, res) => {
  console.log('接收到更新商品请求，ID:', req.params.id, '数据:', req.body);
  try {
    // 检查商品编码是否与其他商品重复
    if (req.body.code) {
      const existingProduct = await Product.findOne({
        code: req.body.code,
        _id: { $ne: req.params.id }
      });
      if (existingProduct) {
        console.log('商品编码已存在:', req.body.code);
        return res.status(400).json({
          code: 400,
          message: '商品编码已存在'
        });
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      console.log('商品不存在:', req.params.id);
      return res.status(404).json({
        code: 404,
        message: '商品不存在'
      });
    }
    
    console.log('商品更新成功:', product);
    
    res.json({
      code: 200,
      data: product,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新商品失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新商品失败: ' + error.message
    });
  }
});

// 批量删除商品
router.delete('/batch', async (req, res) => {
  console.log('接收到批量删除商品请求，IDs:', req.body.ids);
  try {
    const { ids } = req.body;
    const result = await Product.deleteMany({ _id: { $in: ids } });
    
    console.log('批量删除结果:', result);
    
    res.json({
      code: 200,
      message: '批量删除成功'
    });
  } catch (error) {
    console.error('批量删除商品失败:', error);
    res.status(500).json({
      code: 500,
      message: '批量删除商品失败: ' + error.message
    });
  }
});

// 删除商品
router.delete('/:id', async (req, res) => {
  console.log('接收到删除商品请求，ID:', req.params.id);
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      console.log('商品不存在:', req.params.id);
      return res.status(404).json({
        code: 404,
        message: '商品不存在'
      });
    }
    
    console.log('商品删除成功:', product);
    
    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除商品失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除商品失败: ' + error.message
    });
  }
});

// 搜索商品
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const products = await Product.find({
      $or: [
        { name: new RegExp(query, 'i') },
        { code: new RegExp(query, 'i') }
      ]
    }).limit(10);
    
    res.json({
      code: 200,
      data: products
    });
  } catch (error) {
    console.error('搜索商品失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '搜索商品失败'
    });
  }
});

module.exports = router; 