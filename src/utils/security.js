import CryptoJS from 'crypto-js'

// XSS防护：HTML转义
export function escapeHtml(str) {
  if (!str) return ''
  return str.replace(/[&<>"']/g, (match) => {
    const escape = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }
    return escape[match]
  })
}

// 密码加密
export function encryptPassword(password, salt) {
  // 使用SHA256加密
  const hash = CryptoJS.SHA256(password + salt)
  return hash.toString(CryptoJS.enc.Hex)
}

// 生成随机盐值
export function generateSalt(length = 16) {
  return CryptoJS.lib.WordArray.random(length).toString()
}

// 数据加密
export function encrypt(data, key) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString()
}

// 数据解密
export function decrypt(ciphertext, key) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key)
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
  } catch (error) {
    console.error('解密失败:', error)
    return null
  }
}

// 生成随机Token
export function generateToken() {
  return CryptoJS.lib.WordArray.random(32).toString()
}

// 验证密码强度
export function validatePassword(password) {
  const rules = {
    minLength: 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
  
  const errors = []
  if (password.length < rules.minLength) {
    errors.push(`密码长度不能小于${rules.minLength}位`)
  }
  if (!rules.hasUpperCase) {
    errors.push('密码必须包含大写字母')
  }
  if (!rules.hasLowerCase) {
    errors.push('密码必须包含小写字母')
  }
  if (!rules.hasNumbers) {
    errors.push('密码必须包含数字')
  }
  if (!rules.hasSpecialChar) {
    errors.push('密码必须包含特殊字符')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// 防止SQL注入
export function escapeSql(str) {
  if (!str) return ''
  return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
    switch (char) {
      case '\0':
        return '\\0'
      case '\x08':
        return '\\b'
      case '\x09':
        return '\\t'
      case '\x1a':
        return '\\z'
      case '\n':
        return '\\n'
      case '\r':
        return '\\r'
      case '"':
      case "'":
      case '\\':
      case '%':
        return '\\' + char
    }
  })
}

// 生成安全的随机数
export function secureRandom(min, max) {
  const randomBuffer = new Uint32Array(1)
  window.crypto.getRandomValues(randomBuffer)
  const randomNumber = randomBuffer[0] / (0xffffffff + 1)
  return Math.floor(randomNumber * (max - min + 1)) + min
}

// CSP配置
export const cspConfig = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'", 'https:'],
  'frame-src': ["'none'"],
  'object-src': ["'none'"]
} 