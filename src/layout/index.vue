<!-- 布局组件 -->
<template>
  <div class="app-wrapper">
    <!-- 移动端菜单按钮 -->
    <div class="mobile-nav-toggle" @click="toggleMobileMenu">
      <el-icon><Menu /></el-icon>
    </div>

    <!-- 侧边栏 -->
    <div class="sidebar-container" :class="{ 'mobile-sidebar': isMobile, 'show': showMobileMenu }">
      <div class="logo">
        <img src="../assets/logo.svg" alt="Logo">
        <span>物料管理系统</span>
      </div>
      <Sidebar />
    </div>

    <!-- 主内容区 -->
    <div class="main-container" :class="{ 'mobile-main': isMobile }">
      <!-- 头部 -->
      <div class="navbar">
        <div class="right-menu">
          <el-dropdown trigger="click">
            <span class="el-dropdown-link">
              {{ userInfo?.name || '未登录' }}
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 内容区 -->
      <div class="app-main">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ArrowDown, Menu } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import Sidebar from './components/Sidebar.vue'

const store = useStore()
const router = useRouter()

// 获取用户信息
const userInfo = computed(() => store.state.user.userInfo)

// 处理退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    store.dispatch('logout')
    router.push('/login')
  }).catch(() => {})
}

const isMobile = ref(false)
const showMobileMenu = ref(false)

// 检查是否为移动设备
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 切换移动端菜单
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

// 监听窗口大小变化
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.app-wrapper {
  position: relative;
  height: 100vh;
  width: 100%;
}

.mobile-nav-toggle {
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1000;
  padding: 0.5rem;
  background: var(--el-color-primary);
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

@media screen and (max-width: 768px) {
  .mobile-nav-toggle {
    display: block;
  }

  .sidebar-container {
    position: fixed;
    left: -200px;
    top: 0;
    bottom: 0;
    width: 200px;
    z-index: 999;
    transition: all 0.3s;
  }

  .sidebar-container.show {
    left: 0;
  }

  .main-container {
    margin-left: 0 !important;
    padding-top: 60px;
  }

  .navbar {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 998;
    height: 50px;
  }

  .app-main {
    padding: 10px;
  }
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2b2f3a;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
}

.logo img {
  width: 32px;
  height: 32px;
  margin-right: 10px;
}

.navbar {
  height: 60px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.right-menu {
  display: flex;
  align-items: center;
}

.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #606266;
}

.app-main {
  padding: 20px;
  background: #f0f2f5;
  margin-left: 200px;
}
</style> 