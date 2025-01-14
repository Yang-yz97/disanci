<template>
  <div class="not-found">
    <div class="stars"></div>
    <div class="content">
      <h1>404</h1>
      <h2>页面不见了</h2>
      <p>抱歉,您访问的页面可能已经被删除、更名或暂时不可用</p>
      <div class="actions">
        <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
        <el-button @click="$router.go(-1)">返回上一页</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
  overflow: hidden;
  position: relative;
}

.stars {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  animation: space 180s linear infinite;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, #fff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 50px 160px, #fff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 90px 40px, #fff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 130px 80px, #fff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 160px 120px, #fff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
}

@keyframes space {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-200px);
  }
}

.content {
  text-align: center;
  color: #fff;
  z-index: 1;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

h1 {
  font-size: 8rem;
  margin: 0;
  background: linear-gradient(45deg, #409EFF, #66b1ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    text-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
  }
  to {
    text-shadow: 0 0 20px rgba(64, 158, 255, 0.8),
                 0 0 30px rgba(64, 158, 255, 0.6),
                 0 0 40px rgba(64, 158, 255, 0.4);
  }
}

h2 {
  font-size: 2rem;
  margin: 1rem 0;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

p {
  font-size: 1.2rem;
  margin: 1rem 0 2rem;
  color: #bfcbd9;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

:deep(.el-button) {
  padding: 12px 24px;
  font-size: 1.1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.el-button--primary) {
  background: linear-gradient(45deg, #409EFF, #66b1ff);
  border: none;
}

:deep(.el-button:not(.el-button--primary)) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
}

:deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style> 