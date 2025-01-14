import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import validate from './directives/validate'
import { authService } from './services/auth.service'
import request from './utils/request'

const app = createApp(App)

// 注册Element Plus
app.use(ElementPlus)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册表单验证指令
app.use(validate)

// 注册路由
app.use(router)

// 全局配置
app.config.globalProperties.$auth = authService
app.config.globalProperties.$http = request

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('全局错误:', err)
  console.error('错误信息:', info)
}

app.mount('#app') 