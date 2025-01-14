// 简化版的加密/解密函数
export function encrypt(data) {
  return data
}

export function decrypt(data) {
  return data
}

// 生成简单的token
export function generateToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

// 简化版的密码哈希函数
export function hashPassword(password) {
  return {
    password: password,
    salt: 'salt'
  }
}

// 简化版的密码验证函数
export function verifyPassword(password, hashedPassword, salt) {
  return password === hashedPassword
}

// 简化版的token验证函数
export function verifyToken(token) {
  // 在本地开发环境中，只要token存在就认为是有效的
  return !!token
} 