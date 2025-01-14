import request from '@/utils/request'

// 获取出库单列表
export function getOutboundList(params) {
  return request({
    url: '/outbound/list',
    method: 'get',
    params
  })
}

// 获取出库单详情
export function getOutboundDetail(id) {
  return request({
    url: `/outbound/${id}`,
    method: 'get'
  })
}

// 创建出库单
export function createOutbound(data) {
  return request({
    url: '/outbound',
    method: 'post',
    data
  })
}

// 更新出库单
export function updateOutbound(id, data) {
  return request({
    url: `/outbound/${id}`,
    method: 'put',
    data
  })
}

// 删除出库单
export function deleteOutbound(id) {
  return request({
    url: `/outbound/${id}`,
    method: 'delete'
  })
}

// 批量删除出库单
export function batchDeleteOutbound(ids) {
  return request({
    url: '/outbound/batch',
    method: 'delete',
    data: { ids }
  })
}

// 导出出库单
export function exportOutbound(params) {
  return request({
    url: '/outbound/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 搜索商品
export function searchProducts(query) {
  return request({
    url: '/products/search',
    method: 'get',
    params: { query }
  })
} 