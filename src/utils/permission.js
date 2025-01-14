import router from '@/router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

// 权限列表
export const permissions = {
  ADMIN: {
    name: '管理员',
    code: 'admin',
    actions: ['create', 'read', 'update', 'delete', 'export', 'import'],
    resources: ['all']
  },
  MANAGER: {
    name: '经理',
    code: 'manager',
    actions: ['create', 'read', 'update', 'export'],
    resources: ['inventory', 'inbound', 'outbound', 'customers', 'reports']
  },
  USER: {
    name: '普通用户',
    code: 'user',
    actions: ['read'],
    resources: ['inventory']
  }
}

// 路由权限映射
export const routePermissions = {
  '/': {
    roles: ['admin', 'manager', 'user'],
    permissions: ['read']
  },
  '/inbound': {
    roles: ['admin', 'manager'],
    permissions: ['create', 'read']
  },
  '/outbound': {
    roles: ['admin', 'manager'],
    permissions: ['create', 'read']
  },
  '/inventory': {
    roles: ['admin', 'manager', 'user'],
    permissions: ['read']
  },
  '/products': {
    roles: ['admin'],
    permissions: ['create', 'read', 'update', 'delete']
  },
  '/customers': {
    roles: ['admin', 'manager'],
    permissions: ['create', 'read', 'update']
  },
  '/suppliers': {
    roles: ['admin'],
    permissions: ['create', 'read', 'update', 'delete']
  },
  '/reports': {
    roles: ['admin', 'manager'],
    permissions: ['read', 'export']
  }
}

// 操作权限映射
export const actionPermissions = {
  create: '新增',
  read: '查看',
  update: '修改',
  delete: '删除',
  export: '导出',
  import: '导入'
}

/**
 * 检查用户是否有访问某个路由的权限
 * @param {string} route - 路由路径
 * @param {Array} userRoles - 用户角色列表
 * @returns {boolean} - 是否有权限
 */
export const hasPermission = (route, userRoles) => {
  if (!routePermissions[route]) return true
  return routePermissions[route].roles.some(role => userRoles.includes(role))
}

/**
 * 检查用户是否有某个资源的操作权限
 * @param {string} resource - 资源名称
 * @param {string} action - 操作类型
 * @param {Array} userRoles - 用户角色列表
 * @returns {boolean} - 是否有权限
 */
export const hasActionPermission = (resource, action, userRoles = []) => {
  return userRoles.some(role => {
    const rolePermissions = permissions[role.toUpperCase()]
    if (!rolePermissions) return false
    
    return (
      (rolePermissions.resources.includes('all') || rolePermissions.resources.includes(resource)) &&
      rolePermissions.actions.includes(action)
    )
  })
}

/**
 * 获取用户权限列表
 * @returns {Promise<Array>} - 权限列表
 */
export const getUserPermissions = async () => {
  try {
    const { data } = await request({
      url: '/api/auth/permissions',
      method: 'get'
    })
    return data
  } catch (error) {
    console.error('获取权限列表失败:', error)
    return []
  }
}

/**
 * 路由守卫
 */
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  const { roles = [] } = userInfo

  // 白名单路由
  const whiteList = ['/login', '/403', '/404']
  
  if (token) {
    if (to.path === '/login') {
      next('/')
    } else {
      // 检查路由权限
      if (hasPermission(to.path, roles)) {
        // 检查操作权限
        if (to.meta.requiredPermissions) {
          const hasRequired = to.meta.requiredPermissions.every(({ resource, action }) =>
            hasActionPermission(resource, action, roles)
          )
          
          if (hasRequired) {
            next()
          } else {
            ElMessage.error('没有足够的操作权限')
            next('/403')
          }
        } else {
          next()
        }
      } else {
        ElMessage.error('没有访问权限')
        next('/403')
      }
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next('/login')
    }
  }
})

/**
 * 检查按钮级权限
 * @param {string} permission - 权限标识
 * @returns {boolean} - 是否有权限
 */
export const checkBtnPermission = (resource, action) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  const { roles = [] } = userInfo
  return hasActionPermission(resource, action, roles)
}

/**
 * 创建权限指令
 * @example v-permission="{ resource: 'inventory', action: 'create' }"
 */
export const permissionDirective = {
  mounted(el, binding) {
    const { resource, action } = binding.value
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    const { roles = [] } = userInfo
    
    if (!hasActionPermission(resource, action, roles)) {
      el.parentNode?.removeChild(el)
    }
  }
} 