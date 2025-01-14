import { escapeHtml } from '@/utils/security'

// 表单验证规则
const rules = {
  required: {
    validate: value => value !== undefined && value !== null && value !== '',
    message: '此字段为必填项'
  },
  email: {
    validate: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: '请输入有效的邮箱地址'
  },
  phone: {
    validate: value => /^1[3-9]\d{9}$/.test(value),
    message: '请输入有效的手机号码'
  },
  number: {
    validate: value => !isNaN(value) && typeof value !== 'boolean',
    message: '请输入有效的数字'
  },
  integer: {
    validate: value => Number.isInteger(Number(value)),
    message: '请输入有效的整数'
  },
  min: {
    validate: (value, param) => Number(value) >= param,
    message: param => `数值不能小于 ${param}`
  },
  max: {
    validate: (value, param) => Number(value) <= param,
    message: param => `数值不能大于 ${param}`
  },
  minLength: {
    validate: (value, param) => String(value).length >= param,
    message: param => `长度不能小于 ${param} 个字符`
  },
  maxLength: {
    validate: (value, param) => String(value).length <= param,
    message: param => `长度不能大于 ${param} 个字符`
  },
  pattern: {
    validate: (value, param) => new RegExp(param).test(value),
    message: '输入格式不正确'
  }
}

// 验证指令
export const validate = {
  mounted(el, binding) {
    const input = el.tagName === 'INPUT' ? el : el.querySelector('input')
    if (!input) return

    // 获取验证规则
    const validations = binding.value

    // 创建错误提示元素
    const errorEl = document.createElement('div')
    errorEl.style.color = 'red'
    errorEl.style.fontSize = '12px'
    errorEl.style.marginTop = '4px'
    el.appendChild(errorEl)

    // 验证函数
    const validate = () => {
      const value = input.value
      
      // 清除之前的错误
      errorEl.textContent = ''
      input.setCustomValidity('')
      
      // XSS防护
      if (typeof value === 'string') {
        input.value = escapeHtml(value)
      }

      // 验证每个规则
      for (const [ruleName, ruleValue] of Object.entries(validations)) {
        const rule = rules[ruleName]
        if (!rule) continue

        const param = ruleValue === true ? undefined : ruleValue
        const isValid = rule.validate(value, param)

        if (!isValid) {
          const message = typeof rule.message === 'function' 
            ? rule.message(param)
            : rule.message
          
          errorEl.textContent = message
          input.setCustomValidity(message)
          return false
        }
      }

      return true
    }

    // 添加验证事件监听
    input.addEventListener('input', validate)
    input.addEventListener('blur', validate)

    // 存储清理函数
    el._cleanup = () => {
      input.removeEventListener('input', validate)
      input.removeEventListener('blur', validate)
    }
  },

  unmounted(el) {
    // 清理事件监听
    if (el._cleanup) {
      el._cleanup()
    }
  }
}

// 注册指令
export default {
  install(app) {
    app.directive('validate', validate)
  }
} 