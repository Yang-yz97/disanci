import { createRouter, createWebHistory } from 'vue-router'
import { storage } from '@/utils/storage'
import { ElMessage } from 'element-plus'
import Home from '@/views/Home.vue'
import Layout from '@/layout/index.vue'

// 公共路由
export const constantRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { 
      title: '登录',
      noAuth: true
    }
  },
  {
    path: '/403',
    name: '403',
    component: () => import('@/views/error/403.vue'),
    meta: {
      title: '403 Forbidden',
      noAuth: true
    }
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '404 Not Found',
      noAuth: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

// 权限路由
export const asyncRoutes = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Home,
        meta: { 
          title: '首页',
          icon: 'House',
          roles: ['admin', 'user'] // 允许访问的角色
        }
      }
    ]
  },
  {
    path: '/materials',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Materials',
        component: () => import('@/views/Materials.vue'),
        meta: {
          title: '物料管理',
          icon: 'Box',
          roles: ['admin'] // 只允许管理员访问
        }
      }
    ]
  },
  {
    path: '/teams',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Teams',
        component: () => import('@/views/Teams.vue'),
        meta: {
          title: '团队管理',
          icon: 'User',
          roles: ['admin'] // 只允许管理员访问
        }
      }
    ]
  },
  {
    path: '/suppliers',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Suppliers',
        component: () => import('@/views/Suppliers.vue'),
        meta: {
          title: '供应商管理',
          icon: 'Shop',
          roles: ['admin'] // 只允许管理员访问
        }
      }
    ]
  },
  {
    path: '/inbound',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Inbound',
        component: () => import('@/views/Inbound.vue'),
        meta: {
          title: '入库管理',
          icon: 'Download',
          roles: ['admin', 'user'] // 允许管理员和普通用户访问
        }
      }
    ]
  },
  {
    path: '/outbound',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Outbound',
        component: () => import('@/views/Outbound.vue'),
        meta: {
          title: '出库管理',
          icon: 'Upload',
          roles: ['admin', 'user'] // 允许管理员和普通用户访问
        }
      }
    ]
  },
  {
    path: '/inventory',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Inventory',
        component: () => import('@/views/Inventory.vue'),
        meta: { 
          title: '库存管理',
          icon: 'Files',
          roles: ['admin', 'user'] // 允许管理员和普通用户访问
        }
      }
    ]
  },
  {
    path: '/bom',
    component: Layout,
    children: [
      {
        path: '',
        name: 'BOM',
        component: () => import('@/views/BOM.vue'),
        meta: { 
          title: 'BOM管理',
          icon: 'Document',
          roles: ['admin'] // 只允许管理员访问
        }
      }
    ]
  },
  {
    path: '/special-inbound',
    component: Layout,
    children: [
      {
        path: '',
        name: 'SpecialInbound',
        component: () => import('@/views/SpecialInbound.vue'),
        meta: { 
          title: '特殊入库',
          icon: 'Star',
          roles: ['admin'] // 只允许管理员访问
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: [...constantRoutes, ...asyncRoutes]
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 物料管理系统` : '物料管理系统'
  
  // 获取token
  const token = storage.getStorageData('token')
  const userInfo = storage.getStorageData('userInfo')
  
  // 如果是不需要认证的页面，直接放行
  if (to.meta.noAuth) {
    next()
    return
  }
  
  // 如果没有token且不是登录页，跳转到登录页
  if (!token && to.path !== '/login') {
    ElMessage.warning('请先登录')
    next('/login')
    return
  }
  
  // 如果有token且是登录页，跳转到首页
  if (token && to.path === '/login') {
    next('/')
    return
  }

  // 检查用户权限
  if (to.meta.roles && !to.meta.roles.includes(userInfo?.roles?.[0])) {
    ElMessage.error('您没有访问权限')
    next('/403')
    return
  }
  
  // 记录用户访问日志
  console.log('Access Log:', {
    path: to.path,
    user: userInfo?.username,
    time: new Date().toISOString()
  })
  
  next()
})

// 路由错误处理
router.onError((error) => {
  console.error('路由错误:', error)
  ElMessage.error('页面加载失败，请重试')
})

export default router 