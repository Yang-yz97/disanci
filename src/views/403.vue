<template>
  <div class="error-page">
    <el-result
      icon="warning"
      title="403 Forbidden"
      sub-title="抱歉,您没有权限访问此页面"
    >
      <template #extra>
        <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped>
.error-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--dark-gradient);
}

:deep(.el-result__icon) {
  color: #f56c6c;
}

:deep(.el-result__title) {
  color: var(--el-text-color-primary);
}

:deep(.el-result__sub-title) {
  color: var(--el-text-color-secondary);
}
</style> 