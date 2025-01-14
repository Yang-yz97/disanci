import { storage } from '@/utils/storage'
import { encrypt } from '@/utils/crypto'

const state = {
  token: storage.getStorageData('token') || '',
  userInfo: storage.getStorageData('userInfo') || null
}

const mutations = {
  SET_TOKEN(state, token) {
    state.token = token
    storage.setStorageData('token', token)
  },
  SET_USER_INFO(state, userInfo) {
    state.userInfo = userInfo
    storage.setStorageData('userInfo', userInfo)
  },
  CLEAR_USER(state) {
    state.token = ''
    state.userInfo = null
    storage.removeStorageData('token')
    storage.removeStorageData('userInfo')
  }
}

const actions = {
  // 登录
  async login({ commit }, loginForm) {
    try {
      // 这里暂时使用模拟数据，后续接入真实接口
      const mockUserInfo = {
        id: '1',
        username: loginForm.username,
        name: '管理员',
        avatar: '',
        roles: ['admin']
      }
      const mockToken = 'mock_token_' + Date.now()

      commit('SET_TOKEN', mockToken)
      commit('SET_USER_INFO', mockUserInfo)
      
      return true
    } catch (error) {
      console.error('登录失败:', error)
      return false
    }
  },

  // 登出
  async logout({ commit }) {
    try {
      commit('CLEAR_USER')
      return true
    } catch (error) {
      console.error('登出失败:', error)
      return false
    }
  },

  // 获取用户信息
  async getUserInfo({ commit }) {
    try {
      const userInfo = storage.getStorageData('userInfo')
      if (userInfo) {
        commit('SET_USER_INFO', userInfo)
        return userInfo
      }
      return null
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
} 