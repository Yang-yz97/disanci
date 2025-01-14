<template>
  <div class="sidebar">
    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapse"
      :unique-opened="true"
      :collapse-transition="false"
      class="el-menu-vertical"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
      router
    >
      <template v-for="menu in menus" :key="menu.title">
        <el-sub-menu v-if="menu.children" :index="menu.title">
          <template #title>
            <el-icon><component :is="menu.icon" /></el-icon>
            <span>{{ menu.title }}</span>
          </template>
          <el-menu-item
            v-for="submenu in menu.children"
            :key="submenu.path"
            :index="submenu.path"
          >
            <el-icon><component :is="submenu.icon" /></el-icon>
            <template #title>{{ submenu.title }}</template>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item v-else :index="menu.path">
          <el-icon><component :is="menu.icon" /></el-icon>
          <template #title>{{ menu.title }}</template>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  HomeFilled,
  Goods,
  User,
  Shop,
  Box,
  DocumentAdd,
  Search,
  Plus,
  Star,
  ArrowRight
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 菜单配置
const menus = [
  {
    title: '首页',
    path: 'dashboard',
    icon: 'HomeFilled'
  },
  {
    title: '物料管理',
    path: 'materials',
    icon: 'Goods'
  },
  {
    title: '团队管理',
    path: 'teams',
    icon: 'User'
  },
  {
    title: '供应商管理',
    path: 'suppliers',
    icon: 'Shop'
  },
  {
    title: '库存管理',
    icon: 'Box',
    children: [
      {
        title: 'BOM管理',
        path: 'bom',
        icon: 'DocumentAdd'
      },
      {
        title: '库存查询',
        path: 'inventory',
        icon: 'Search'
      }
    ]
  },
  {
    title: '入库管理',
    icon: 'Box',
    children: [
      {
        title: '普通入库',
        path: 'inbound',
        icon: 'Plus'
      },
      {
        title: '特殊入库',
        path: 'special-inbound',
        icon: 'Star'
      }
    ]
  },
  {
    title: '出库管理',
    path: 'outbound',
    icon: 'ArrowRight'
  }
]

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 是否折叠
const isCollapse = ref(false)

// 处理菜单选择
const handleSelect = (index) => {
  router.push(index)
}
</script>

<style scoped>
.sidebar {
  height: 100%;
  background-color: #304156;
}

.el-menu-vertical {
  height: 100%;
  border-right: none;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 200px;
}

:deep(.el-menu-item.is-active) {
  background-color: #263445 !important;
}

:deep(.el-sub-menu__title:hover),
:deep(.el-menu-item:hover) {
  background-color: #263445 !important;
}

:deep(.el-sub-menu.is-active .el-sub-menu__title) {
  color: #409EFF !important;
}
</style> 