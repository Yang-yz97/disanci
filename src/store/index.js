import { createStore } from 'vuex'
import user from './modules/user'

const store = createStore({
  modules: {
    user
  },
  // 全局状态
  state: {
    // 应用配置
    settings: {
      title: '物料管理系统',
      theme: 'light',
      showSettings: false
    }
  },
  mutations: {
    // 更新应用配置
    UPDATE_SETTINGS(state, settings) {
      state.settings = {
        ...state.settings,
        ...settings
      }
    }
  },
  actions: {
    // 初始化应用
    initApp({ dispatch }) {
      // 获取用户信息
      dispatch('user/getUserInfo')
    }
  }
})

export default store 