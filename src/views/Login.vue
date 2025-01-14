<template>
  <div class="login-container">
    <div class="login-box">
      <h2>物料管理系统</h2>
      <el-form ref="loginForm" :model="loginForm" @submit.prevent="handleLogin">
        <el-form-item>
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            prefix-icon="User"
            v-validate="{
              required: true,
              minLength: 3,
              maxLength: 20
            }"
            @keyup.enter="focusPassword"
          />
        </el-form-item>
        
        <el-form-item>
          <el-input
            ref="passwordInput"
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            show-password
            v-validate="{
              required: true,
              minLength: 6,
              pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{6,}$'
            }"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="rememberMe">记住密码</el-checkbox>
            <el-link type="primary" @click="handleForgotPassword">忘记密码？</el-link>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading"
            class="login-button" 
            @click="handleLogin"
            :disabled="loginAttempts >= maxLoginAttempts"
          >
            {{ getLoginButtonText }}
          </el-button>
        </el-form-item>

        <div v-if="loginAttempts > 0" class="login-attempts">
          剩余尝试次数: {{ maxLoginAttempts - loginAttempts }}
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { encrypt, decrypt } from '@/utils/security'

const { proxy } = getCurrentInstance()
const router = useRouter()
const passwordInput = ref(null)

// 表单数据
const loginForm = ref({
  username: '',
  password: ''
})

// 状态变量
const loading = ref(false)
const rememberMe = ref(false)
const loginAttempts = ref(0)
const maxLoginAttempts = 5
const lockoutEndTime = ref(null)

// 计算登录按钮文本
const getLoginButtonText = computed(() => {
  if (loading.value) return '登录中...'
  if (loginAttempts.value >= maxLoginAttempts) {
    const remainingTime = Math.ceil((lockoutEndTime.value - Date.now()) / 1000)
    return \`请等待 \${remainingTime} 秒\`
  }
  return '登录'
})

// 焦点管理
const focusPassword = () => {
  passwordInput.value?.focus()
}

// 检查是否被锁定
const checkLockout = () => {
  if (lockoutEndTime.value && Date.now() < lockoutEndTime.value) {
    return true
  }
  if (lockoutEndTime.value && Date.now() >= lockoutEndTime.value) {
    loginAttempts.value = 0
    lockoutEndTime.value = null
  }
  return false
}

// 处理登录
const handleLogin = async () => {
  if (checkLockout()) {
    ElMessage.error('账户已被锁定，请稍后再试')
    return
  }

  try {
    loading.value = true
    
    // 表单验证
    const form = document.querySelector('form')
    if (!form.checkValidity()) {
      ElMessage.error('请检查输入内容是否正确')
      return
    }
    
    // 调用登录接口
    const result = await proxy.$auth.login(
      loginForm.value.username,
      loginForm.value.password
    )
    
    if (result) {
      // 登录成功，重置尝试次数
      loginAttempts.value = 0
      
      // 处理记住密码
      if (rememberMe.value) {
        const encryptedData = encrypt(loginForm.value, 'login-credentials')
        localStorage.setItem('rememberedUser', encryptedData)
      } else {
        localStorage.removeItem('rememberedUser')
      }
      
      ElMessage.success('登录成功')
      router.push('/')
    } else {
      handleLoginFailure()
    }
  } catch (error) {
    handleLoginFailure()
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

// 处理登录失败
const handleLoginFailure = () => {
  loginAttempts.value++
  
  if (loginAttempts.value >= maxLoginAttempts) {
    lockoutEndTime.value = Date.now() + 5 * 60 * 1000 // 锁定5分钟
    ElMessage.error(\`登录失败次数过多，账户已被锁定 5 分钟\`)
  } else {
    ElMessage.error(\`登录失败，还剩 \${maxLoginAttempts - loginAttempts.value} 次尝试机会\`)
  }
}

// 处理忘记密码
const handleForgotPassword = () => {
  ElMessage.info('请联系系统管理员重置密码')
}

// 加载记住的用户信息
onMounted(() => {
  const rememberedUser = localStorage.getItem('rememberedUser')
  if (rememberedUser) {
    try {
      const decryptedData = decrypt(rememberedUser, 'login-credentials')
      if (decryptedData) {
        loginForm.value = decryptedData
        rememberMe.value = true
      }
    } catch (error) {
      console.error('解密存储的登录信息失败:', error)
      localStorage.removeItem('rememberedUser')
    }
  }
})
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f2f5;
}

.login-box {
  width: 360px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-box h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.login-button {
  width: 100%;
}

.login-attempts {
  text-align: center;
  margin-top: 10px;
  color: #f56c6c;
  font-size: 12px;
}

:deep(.el-input__wrapper) {
  background-color: #f5f7fa;
}

:deep(.el-input__inner) {
  height: 42px;
}
</style> 