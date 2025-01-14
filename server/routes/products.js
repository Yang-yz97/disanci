const express = require('express')
const router = express.Router()
const Product = require('../models/product')

// 获取商品列表
router.get('/list', async (req, res) => {
  console.log('接收到获取商品列表请求:', req.query)
  try {
    const { page = 1, limit = 10, code, name, category } = req.query
    const query = {}
    
    if (code) query.code = new RegExp(code, 'i')
    if (name) query.name = new RegExp(name, 'i')
    if (category) query.category = category
    
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const list = await Product.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
    
    const total = await Product.countDocuments(query)
    
    console.log('查询结果:', { total, listLength: list.length })
    
    res.json({
      code: 200,
      data: {
        list,
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      },
      message: '获取商品列表成功'
    })
  } catch (error) {
    console.error('获取商品列表失败:', error)
    res.status(500).json({
      code: 500,
      message: '获取商品列表失败'
    })
  }
})

// 创建商品
router.post('/', async (req, res) => {
  console.log('接收到创建商品请求:', req.body)
  try {
    const { code } = req.body
    // 检查商品编码是否已存在
    const existingProduct = await Product.findOne({ code })
    if (existingProduct) {
      return res.status(400).json({
        code: 400,
        message: '商品编码已存在'
      })
    }
    
    const product = new Product(req.body)
    await product.save()
    
    console.log('创建商品成功:', product)
    
    res.json({
      code: 200,
      data: product,
      message: '创建商品成功'
    })
  } catch (error) {
    console.error('创建商品失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '创建商品失败'
    })
  }
})

// 更新商品
router.put('/:id', async (req, res) => {
  console.log('接收到更新商品请求:', { id: req.params.id, body: req.body })
  try {
    const { id } = req.params
    const { code } = req.body
    
    // 检查商品编码是否已被其他商品使用
    const existingProduct = await Product.findOne({ code, _id: { $ne: id } })
    if (existingProduct) {
      return res.status(400).json({
        code: 400,
        message: '商品编码已被其他商品使用'
      })
    }
    
    const product = await Product.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    )
    
    if (!product) {
      return res.status(404).json({
        code: 404,
        message: '商品不存在'
      })
    }
    
    console.log('更新商品成功:', product)
    
    res.json({
      code: 200,
      data: product,
      message: '更新商品成功'
    })
  } catch (error) {
    console.error('更新商品失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '更新商品失败'
    })
  }
})

// 删除商品
router.delete('/:id', async (req, res) => {
  console.log('接收到删除商品请求:', req.params.id)
  try {
    const { id } = req.params
    const product = await Product.findByIdAndDelete(id)
    
    if (!product) {
      return res.status(404).json({
        code: 404,
        message: '商品不存在'
      })
    }
    
    console.log('删除商品成功:', product)
    
    res.json({
      code: 200,
      message: '删除商品成功'
    })
  } catch (error) {
    console.error('删除商品失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '删除商品失败'
    })
  }
})

// 批量删除商品
router.delete('/batch', async (req, res) => {
  console.log('接收到批量删除商品请求:', req.body)
  try {
    const { ids } = req.body
    const result = await Product.deleteMany({ _id: { $in: ids } })
    
    console.log('批量删除商品成功:', result)
    
    res.json({
      code: 200,
      message: '批量删除商品成功'
    })
  } catch (error) {
    console.error('批量删除商品失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '批量删除商品失败'
    })
  }
})

// 搜索商品
router.get('/search', async (req, res) => {
  console.log('接收到搜索商品请求:', req.query)
  try {
    const { query } = req.query
    const products = await Product.find({
      $or: [
        { name: new RegExp(query, 'i') },
        { code: new RegExp(query, 'i') }
      ]
    }).limit(10)
    
    console.log('搜索商品结果:', products.length)
    
    res.json({
      code: 200,
      data: products,
      message: '搜索商品成功'
    })
  } catch (error) {
    console.error('搜索商品失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '搜索商品失败'
    })
  }
})

module.exports = router 