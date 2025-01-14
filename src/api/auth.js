import request from '@/utils/request'

/**
 * 登录
 * @param {Object} data
 * @returns {Promise}
 */
export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

/**
 * 登出
 * @returns {Promise}
 */
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

/**
 * 刷新Token
 * @param {string} refreshToken
 * @returns {Promise}
 */
export function refreshToken(refreshToken) {
  return request({
    url: '/auth/refresh-token',
    method: 'post',
    data: { refreshToken }
  })
}

/**
 * 获取用户信息
 * @returns {Promise}
 */
export function getUserInfo() {
  return request({
    url: '/auth/user-info',
    method: 'get'
  })
}

/**
 * 修改密码
 * @param {Object} data
 * @returns {Promise}
 */
export function changePassword(data) {
  return request({
    url: '/auth/change-password',
    method: 'post',
    data
  })
}

/**
 * 获取验证码
 * @returns {Promise}
 */
export function getCaptcha() {
  return request({
    url: '/auth/captcha',
    method: 'get'
  })
}

/**
 * 获取用户权限
 * @returns {Promise}
 */
export function getPermissions() {
  return request({
    url: '/auth/permissions',
    method: 'get'
  })
} 