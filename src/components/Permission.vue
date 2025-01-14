<!-- 权限控制组件 -->
<template>
  <component :is="tag" v-if="hasPermission">
    <slot></slot>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const props = defineProps({
  // 需要的权限
  permission: {
    type: String,
    required: true
  },
  // 包裹元素的标签
  tag: {
    type: String,
    default: 'div'
  }
})

const store = useStore()

// 判断当前用户是否有权限
const hasPermission = computed(() => {
  const userInfo = store.state.user.userInfo
  if (!userInfo) return false
  
  // 管理员拥有所有权限
  if (userInfo.role === 'admin' || userInfo.permissions.includes('all')) {
    return true
  }
  
  // 检查是否有特定权限
  return userInfo.permissions.includes(props.permission)
})
</script> 