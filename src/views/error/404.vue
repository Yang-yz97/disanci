<template>
  <div class="error-page">
    <div class="error-content">
      <h1>404</h1>
      <h2>抱歉，页面不存在</h2>
      <p>您访问的页面已被移动或不存在</p>
      <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f2f5;
}

.error-content {
  text-align: center;
}

.error-content h1 {
  font-size: 120px;
  color: #1890ff;
  margin-bottom: 20px;
}

.error-content h2 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 10px;
}

.error-content p {
  font-size: 16px;
  color: #909399;
  margin-bottom: 20px;
}
</style> 