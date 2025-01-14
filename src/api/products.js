import request from '@/utils/request'

// 获取商品列表
export function getProductList(params) {
  return request({
    url: '/api/products/list',
    method: 'get',
    params
  })
}

// 创建商品
export function createProduct(data) {
  return request({
    url: '/api/products',
    method: 'post',
    data
  })
}

// 更新商品
export function updateProduct(id, data) {
  return request({
    url: `/api/products/${id}`,
    method: 'put',
    data
  })
}

// 删除商品
export function deleteProduct(id) {
  return request({
    url: `/api/products/${id}`,
    method: 'delete'
  })
}

// 批量删除商品
export function batchDeleteProducts(ids) {
  return request({
    url: '/api/products/batch',
    method: 'delete',
    data: { ids }
  })
}

// 搜索商品
export function searchProducts(query) {
  return request({
    url: '/api/products/search',
    method: 'get',
    params: { query }
  })
} 