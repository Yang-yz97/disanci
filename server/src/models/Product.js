const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  specification: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['electronics', 'clothing', 'food', 'books', 'others']
  },
  unit: {
    type: String,
    required: true,
    default: '个'
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  minStock: {
    type: Number,
    default: 0,
    min: 0
  },
  maxStock: {
    type: Number,
    default: 0,
    min: 0
  },
  barcode: {
    type: String,
    trim: true
  },
  remark: {
    type: String,
    trim: true
  }
}, {
  timestamps: true // 自动添加 createdAt 和 updatedAt 字段
});

// 添加索引
productSchema.index({ code: 1 }, { unique: true });
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });

module.exports = mongoose.model('Product', productSchema); 