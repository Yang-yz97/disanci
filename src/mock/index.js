import MockAdapter from 'axios-mock-adapter'
import { generateToken, verifyPassword, hashPassword, verifyToken, encrypt } from '@/utils/crypto'
import { products, customers, suppliers, inboundList, outboundList, generateNo, handlePagination, addProduct, updateProduct, deleteProduct, saveAllData } from './business'

// 用户数据
const users = [
  {
    id: 1,
    username: 'admin',
    password: encrypt('Admin@123'),
    name: '管理员',
    role: 'admin',
    permissions: ['all']
  },
  {
    id: 2,
    username: 'manager',
    password: encrypt('Manager@123'),
    name: '经理',
    role: 'manager',
    permissions: ['read', 'create', 'update', 'export']
  },
  {
    id: 3,
    username: 'user',
    password: encrypt('User@123'),
    name: '普通用户',
    role: 'user',
    permissions: ['read']
  }
]

// 验证码存储
const captchas = new Map()

// 设置mock服务
export default function setupMock(instance) {
  const mock = new MockAdapter(instance, { delayResponse: 1000 })

  // 获取物料列表
  mock.onGet('/products/list').reply(config => {
    try {
      const { page = 1, limit = 10, code, name, category, status } = config.params
      let filteredList = [...products]
      
      if (code) {
        filteredList = filteredList.filter(item => item.code.includes(code))
      }
      if (name) {
        filteredList = filteredList.filter(item => item.name.includes(name))
      }
      if (category) {
        filteredList = filteredList.filter(item => item.category === category)
      }
      if (status) {
        filteredList = filteredList.filter(item => item.status === status)
      }
      
      const result = handlePagination(filteredList, page, limit)
      
      return [200, {
        code: 200,
        message: 'success',
        data: {
          list: result.list,
          total: filteredList.length,
          page: result.page,
          limit: result.limit
        }
      }]
    } catch (error) {
      console.error('获取物料列表失败:', error)
      return [500, { code: 500, message: error.message || '获取物料列表失败' }]
    }
  })

  // 获取团队列表
  mock.onGet('/customers/list').reply(config => {
    try {
      const { page = 1, limit = 10, code, name, status } = config.params
      let filteredList = [...customers]
      
      if (code) {
        filteredList = filteredList.filter(item => item.code.includes(code))
      }
      if (name) {
        filteredList = filteredList.filter(item => item.name.includes(name))
      }
      if (status) {
        filteredList = filteredList.filter(item => item.status === status)
      }
      
      const result = handlePagination(filteredList, page, limit)
      
      return [200, {
        code: 200,
        message: 'success',
        data: {
          list: result.list,
          total: filteredList.length,
          page: result.page,
          limit: result.limit
        }
      }]
    } catch (error) {
      console.error('获取团队列表失败:', error)
      return [500, { code: 500, message: error.message || '获取团队列表失败' }]
    }
  })

  // 获取供应商列表
  mock.onGet('/suppliers/list').reply(config => {
    try {
      const { page = 1, limit = 10, code, name, status } = config.params
      let filteredList = [...suppliers]
      
      if (code) {
        filteredList = filteredList.filter(item => item.code.includes(code))
      }
      if (name) {
        filteredList = filteredList.filter(item => item.name.includes(name))
      }
      if (status) {
        filteredList = filteredList.filter(item => item.status === status)
      }
      
      const result = handlePagination(filteredList, page, limit)
      
      return [200, {
        code: 200,
        message: 'success',
        data: {
          list: result.list,
          total: filteredList.length,
          page: result.page,
          limit: result.limit
        }
      }]
    } catch (error) {
      console.error('获取供应商列表失败:', error)
      return [500, { code: 500, message: error.message || '获取供应商列表失败' }]
    }
  })

  // 获取入库单列表
  mock.onGet('/inbound/list').reply(config => {
    try {
      const { page = 1, limit = 10, code, startDate, endDate } = config.params
      let filteredList = [...inboundList]
      
      if (code) {
        filteredList = filteredList.filter(item => item.code.includes(code))
      }
      if (startDate && endDate) {
        filteredList = filteredList.filter(item => 
          item.date >= startDate && item.date <= endDate
        )
      }
      
      const result = handlePagination(filteredList, page, limit)
      
      return [200, {
        code: 200,
        message: 'success',
        data: {
          list: result.list,
          total: filteredList.length,
          page: result.page,
          limit: result.limit
        }
      }]
    } catch (error) {
      console.error('获取入库单列表失败:', error)
      return [500, { code: 500, message: error.message || '获取入库单列表失败' }]
    }
  })

  // 获取出库单列表
  mock.onGet('/outbound/list').reply(config => {
    try {
      const { page = 1, limit = 10, code, startDate, endDate } = config.params
      let filteredList = [...outboundList]
      
      if (code) {
        filteredList = filteredList.filter(item => item.code.includes(code))
      }
      if (startDate && endDate) {
        filteredList = filteredList.filter(item => 
          item.date >= startDate && item.date <= endDate
        )
      }
      
      const result = handlePagination(filteredList, page, limit)
      
      return [200, {
        code: 200,
        message: 'success',
        data: {
          list: result.list,
          total: filteredList.length,
          page: result.page,
          limit: result.limit
        }
      }]
    } catch (error) {
      console.error('获取出库单列表失败:', error)
      return [500, { code: 500, message: error.message || '获取出库单列表失败' }]
    }
  })

  // 获取预警列表
  mock.onGet('/products/warning').reply(config => {
    try {
      const { page = 1, limit = 5 } = config.params
      
      // 筛选出库存异常的物料
      const warningList = products.filter(item => 
        item.stock === 0 || 
        item.stock < item.minStock || 
        item.stock > item.maxStock
      ).map(item => ({
        ...item,
        warningType: item.stock === 0 ? 'noStock' :
                     item.stock < item.minStock ? 'lowStock' : 'highStock'
      }))
      
      const result = handlePagination(warningList, page, limit)
      
      return [200, {
        code: 200,
        message: 'success',
        data: {
          list: result.list,
          total: warningList.length,
          page: result.page,
          limit: result.limit
        }
      }]
    } catch (error) {
      console.error('获取预警列表失败:', error)
      return [500, { code: 500, message: error.message || '获取预警列表失败' }]
    }
  })

  // 获取统计数据
  mock.onGet('/statistics').reply(() => {
    try {
      // 计算今日入库单
      const today = new Date().toISOString().split('T')[0]
      const todayInbound = inboundList.filter(item => 
        item.date.startsWith(today)
      ).length

      // 计算今日出库单
      const todayOutbound = outboundList.filter(item => 
        item.date.startsWith(today)
      ).length

      // 计算预警物料数量
      const warningCount = products.filter(item => 
        item.stock === 0 || 
        item.stock < item.minStock || 
        item.stock > item.maxStock
      ).length

      // 计算物料总数
      const totalProducts = products.length

      return [200, {
        code: 200,
        message: 'success',
        data: {
          todayInbound,
          todayOutbound,
          warningCount,
          totalProducts
        }
      }]
    } catch (error) {
      console.error('获取统计数据失败:', error)
      return [500, { code: 500, message: error.message || '获取统计数据失败' }]
    }
  })

  // 更新团队
  mock.onPut(/\/customers\/.+/).reply(config => {
    try {
      const id = config.url.split('/').pop()
      const data = JSON.parse(config.data)
      const index = customers.findIndex(item => item.id === id)
      
      if (index === -1) {
        console.error('团队不存在:', id)
        return [404, { code: 404, message: '团队不存在' }]
      }
      
      customers[index] = { ...customers[index], ...data }
      saveAllData()
      return [200, { code: 200, message: '更新成功' }]
    } catch (error) {
      console.error('更新团队失败:', error)
      return [500, { code: 500, message: error.message || '更新团队失败' }]
    }
  })

  // 删除团队
  mock.onDelete(/\/customers\/.+/).reply(config => {
    try {
      const id = config.url.split('/').pop()
      const index = customers.findIndex(item => item.id === id)
      
      if (index === -1) {
        console.error('团队不存在:', id)
        return [404, { code: 404, message: '团队不存在' }]
      }
      
      customers.splice(index, 1)
      saveAllData()
      return [200, { code: 200, message: '删除成功' }]
    } catch (error) {
      console.error('删除团队失败:', error)
      return [500, { code: 500, message: error.message || '删除团队失败' }]
    }
  })

  // 批量删除团队
  mock.onPost('/customers/batch/delete').reply(config => {
    try {
      const { ids } = JSON.parse(config.data)
      if (!Array.isArray(ids)) {
        throw new Error('参数错误')
      }
      
      ids.forEach(id => {
        const index = customers.findIndex(item => item.id === id)
        if (index !== -1) {
          customers.splice(index, 1)
        }
      })
      
      saveAllData()
      return [200, { code: 200, message: '批量删除成功' }]
    } catch (error) {
      console.error('批量删除团队失败:', error)
      return [500, { code: 500, message: error.message || '批量删除团队失败' }]
    }
  })

  // 更新供应商
  mock.onPut(/\/suppliers\/.+/).reply(config => {
    try {
      const id = config.url.split('/').pop()
      const data = JSON.parse(config.data)
      const index = suppliers.findIndex(item => item.id === id)
      
      if (index === -1) {
        console.error('供应商不存在:', id)
        return [404, { code: 404, message: '供应商不存在' }]
      }
      
      suppliers[index] = { ...suppliers[index], ...data }
      saveAllData()
      return [200, { code: 200, message: '更新成功' }]
    } catch (error) {
      console.error('更新供应商失败:', error)
      return [500, { code: 500, message: error.message || '更新供应商失败' }]
    }
  })

  // 删除供应商
  mock.onDelete(/\/suppliers\/.+/).reply(config => {
    try {
      const id = config.url.split('/').pop()
      const index = suppliers.findIndex(item => item.id === id)
      
      if (index === -1) {
        console.error('供应商不存在:', id)
        return [404, { code: 404, message: '供应商不存在' }]
      }
      
      suppliers.splice(index, 1)
      saveAllData()
      
      return [200, { code: 200, message: '删除成功' }]
    } catch (error) {
      console.error('删除供应商失败:', error)
      return [500, { code: 500, message: error.message || '删除供应商失败' }]
    }
  })

  // 批量删除供应商
  mock.onPost('/suppliers/batch/delete').reply(config => {
    try {
      const { ids } = JSON.parse(config.data)
      
      ids.forEach(id => {
        const index = suppliers.findIndex(item => item.id === id)
        if (index !== -1) {
          suppliers.splice(index, 1)
        }
      })
      
      saveAllData()
      
      return [200, {
        code: 200,
        message: 'success'
      }]
    } catch (error) {
      console.error('批量删除供应商失败:', error)
      return [500, { code: 500, message: error.message || '批量删除供应商失败' }]
    }
  })

  // 更新物料
  mock.onPut(/\/products\/\d+/).reply(config => {
    try {
      const id = parseInt(config.url.match(/\/products\/(\d+)/)[1])
      const data = JSON.parse(config.data)
      const index = products.findIndex(item => item.id === id)
      
      if (index === -1) {
        return [404, { code: 404, message: '物料不存在' }]
      }
      
      products[index] = { ...products[index], ...data }
      saveAllData()
      
      return [200, {
        code: 200,
        message: 'success',
        data: products[index]
      }]
    } catch (error) {
      console.error('更新物料失败:', error)
      return [500, { code: 500, message: error.message || '更新物料失败' }]
    }
  })

  // 删除物料
  mock.onDelete(/\/products\/\d+/).reply(config => {
    try {
      const id = parseInt(config.url.match(/\/products\/(\d+)/)[1])
      const index = products.findIndex(item => item.id === id)
      
      if (index === -1) {
        return [404, { code: 404, message: '物料不存在' }]
      }
      
      products.splice(index, 1)
      saveAllData()
      
      return [200, {
        code: 200,
        message: 'success'
      }]
    } catch (error) {
      console.error('删除物料失败:', error)
      return [500, { code: 500, message: error.message || '删除物料失败' }]
    }
  })

  // 批量删除物料
  mock.onPost('/products/batch/delete').reply(config => {
    try {
      const { ids } = JSON.parse(config.data)
      
      ids.forEach(id => {
        const index = products.findIndex(item => item.id === id)
        if (index !== -1) {
          products.splice(index, 1)
        }
      })
      
      saveAllData()
      
      return [200, {
        code: 200,
        message: 'success'
      }]
    } catch (error) {
      console.error('批量删除物料失败:', error)
      return [500, { code: 500, message: error.message || '批量删除物料失败' }]
    }
  })

  // 新增物料
  mock.onPost('/products').reply(config => {
    try {
      const data = JSON.parse(config.data)
      const result = addProduct(data)
      
      return [200, {
        code: 200,
        message: 'success',
        data: result
      }]
    } catch (error) {
      console.error('新增物料失败:', error)
      return [500, { code: 500, message: error.message || '新增物料失败' }]
    }
  })

  // 添加团队
  mock.onPost('/customers').reply(config => {
    try {
      const team = JSON.parse(config.data)
      team.id = generateNo('T')
      team.createTime = new Date().toISOString()
      customers.push(team)
      saveAllData()
      return [200, { code: 200, message: 'success', data: team }]
    } catch (error) {
      console.error('创建团队失败:', error)
      return [500, { code: 500, message: error.message || '创建团队失败' }]
    }
  })

  // 添加供应商
  mock.onPost('/suppliers').reply(config => {
    try {
      const supplier = JSON.parse(config.data)
      supplier.id = generateNo('S')
      supplier.createTime = new Date().toISOString()
      suppliers.push(supplier)
      saveAllData()
      return [200, { code: 200, message: '新增成功', data: supplier }]
    } catch (error) {
      console.error('创建供应商失败:', error)
      return [500, { code: 500, message: error.message || '创建供应商失败' }]
    }
  })
} 