/**
 * 用户状态管理 Store
 *
 * 使用 Zustand 管理全局用户登录状态
 * 这是企业级应用中状态管理的典型实现
 *
 * 【设计要点】
 * 1. 集中管理用户认证状态
 * 2. 持久化存储（Token、用户信息）
 * 3. 自动Token刷新机制
 * 4. 统一的登录/登出流程
 */

import { create } from 'zustand'
import Taro from '@tarojs/taro'
import {
  UserInfo,
  UserStats,
  TokenInfo,
  LoginParams,
  LoginResponse,
  UpdateUserParams,
} from '@/types/user'
import { authService } from '@/services/auth'
import {
  saveTokenInfo,
  getTokenInfo,
  clearAuthData,
  saveUserInfo,
  getUserInfo,
  isLoggedIn as checkIsLoggedIn,
  needRefreshToken,
  getRefreshToken,
  saveRememberedPhone,
  navigateAfterLogin,
} from '@/utils/auth'
import { mockLoginUserStats } from '@/mock/user'

// ==================== 类型定义 ====================

/**
 * 用户Store状态
 */
interface UserState {
  /** 是否已登录 */
  isLoggedIn: boolean
  /** 是否正在加载 */
  isLoading: boolean
  /** 是否已初始化完成 */
  isInitialized: boolean
  /** 用户信息 */
  userInfo: UserInfo | null
  /** 用户统计数据 */
  userStats: UserStats | null
  /** Token信息 */
  tokenInfo: TokenInfo | null
  /** 错误信息 */
  error: string | null
}

/**
 * 用户Store操作
 */
interface UserActions {
  /** 初始化：从本地存储恢复登录状态 */
  initialize: () => Promise<void>
  /** 登录 */
  login: (params: LoginParams) => Promise<LoginResponse>
  /** 登出 */
  logout: () => Promise<void>
  /** 刷新Token */
  refreshToken: () => Promise<void>
  /** 获取用户信息 */
  fetchUserInfo: () => Promise<void>
  /** 更新用户信息 */
  updateUserInfo: (params: UpdateUserParams) => Promise<void>
  /** 清除错误 */
  clearError: () => void
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void
  /** 设置用户统计数据 */
  setUserStats: (stats: UserStats) => void
}

/**
 * 完整的Store类型
 */
type UserStore = UserState & UserActions

// ==================== 初始状态 ====================

const initialState: UserState = {
  isLoggedIn: false,
  isLoading: false,
  isInitialized: false,
  userInfo: null,
  userStats: null,
  tokenInfo: null,
  error: null,
}

// ==================== 创建Store ====================

/**
 * 用户Store
 *
 * @example
 * ```typescript
 * // 在组件中使用
 * const { isLoggedIn, userInfo, login, logout } = useUserStore()
 *
 * // 登录
 * await login({ type: 'phone_code', phone: '13800138000', code: '123456' })
 *
 * // 登出
 * await logout()
 * ```
 */
export const useUserStore = create<UserStore>((set, get) => ({
  // 初始状态
  ...initialState,

  /**
   * 初始化
   * 应用启动时调用，从本地存储恢复登录状态
   */
  initialize: async () => {
    try {
      set({ isLoading: true })

      // 从本地存储读取Token和用户信息
      const tokenInfo = getTokenInfo()
      const userInfo = getUserInfo()

      // 检查是否已登录
      if (checkIsLoggedIn() && tokenInfo && userInfo) {
        // 检查是否需要刷新Token
        if (needRefreshToken()) {
          try {
            // 尝试刷新Token
            const newTokenInfo = await authService.refreshToken(getRefreshToken())
            saveTokenInfo(newTokenInfo)

            set({
              isLoggedIn: true,
              userInfo,
              tokenInfo: newTokenInfo,
              userStats: mockLoginUserStats[userInfo.id] || null,
            })
          } catch (error) {
            // 刷新失败，清除登录状态
            console.error('Token刷新失败:', error)
            clearAuthData()
            set({ ...initialState })
          }
        } else {
          // Token有效，直接恢复状态
          set({
            isLoggedIn: true,
            userInfo,
            tokenInfo,
            userStats: mockLoginUserStats[userInfo.id] || null,
          })
        }
      } else {
        // 未登录或Token已过期
        set({ ...initialState })
      }
    } catch (error: any) {
      console.error('初始化失败:', error)
      set({ error: error.message })
    } finally {
      set({ isLoading: false, isInitialized: true })
    }
  },

  /**
   * 登录
   *
   * @param params - 登录参数
   * @returns 登录响应
   */
  login: async (params: LoginParams) => {
    try {
      set({ isLoading: true, error: null })

      // 调用登录API
      const response = await authService.login(params)
      const { userInfo, tokenInfo, isNewUser } = response

      // 保存到本地存储
      saveTokenInfo(tokenInfo)
      saveUserInfo(userInfo)

      // 记住手机号（如果是手机号登录）
      if (params.type === 'phone_code' || params.type === 'phone_password') {
        saveRememberedPhone(params.phone)
      }

      // 获取用户统计数据
      const userStats = mockLoginUserStats[userInfo.id] || {
        followingCount: 0,
        followerCount: 0,
        likeCount: 0,
        worksCount: 0,
        likesCount: 0,
      }

      // 更新状态
      set({
        isLoggedIn: true,
        userInfo,
        tokenInfo,
        userStats,
        error: null,
      })

      // 显示登录成功提示
      Taro.showToast({
        title: isNewUser ? '欢迎新用户' : '登录成功',
        icon: 'success',
        duration: 1500,
      })

      return response
    } catch (error: any) {
      const errorMessage = error.message || '登录失败'
      set({ error: errorMessage })

      // 显示错误提示
      Taro.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 2000,
      })

      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  /**
   * 登出
   */
  logout: async () => {
    try {
      set({ isLoading: true })

      // 调用登出API（通知服务端清除Token）
      await authService.logout()

      // 清除本地存储
      clearAuthData()

      // 重置状态
      set({
        ...initialState,
        isInitialized: true, // 保持初始化状态
      })

      // 显示提示
      Taro.showToast({
        title: '已退出登录',
        icon: 'success',
        duration: 1500,
      })

      // 跳转到首页
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/index/index' })
      }, 500)
    } catch (error: any) {
      console.error('登出失败:', error)
      // 即使API调用失败，也要清除本地状态
      clearAuthData()
      set({
        ...initialState,
        isInitialized: true,
      })
    } finally {
      set({ isLoading: false })
    }
  },

  /**
   * 刷新Token
   */
  refreshToken: async () => {
    try {
      const refreshTokenValue = getRefreshToken()
      if (!refreshTokenValue) {
        throw new Error('无效的刷新Token')
      }

      const newTokenInfo = await authService.refreshToken(refreshTokenValue)

      // 保存新Token
      saveTokenInfo(newTokenInfo)

      // 更新状态
      set({ tokenInfo: newTokenInfo })

      console.log('Token刷新成功')
    } catch (error: any) {
      console.error('Token刷新失败:', error)
      // 刷新失败，登出用户
      await get().logout()
      throw error
    }
  },

  /**
   * 获取用户信息
   */
  fetchUserInfo: async () => {
    try {
      set({ isLoading: true })

      const { userInfo, stats } = await authService.getCurrentUserInfo()

      // 保存到本地存储
      saveUserInfo(userInfo)

      // 更新状态
      set({
        userInfo,
        userStats: stats,
      })
    } catch (error: any) {
      console.error('获取用户信息失败:', error)
      set({ error: error.message })
    } finally {
      set({ isLoading: false })
    }
  },

  /**
   * 更新用户信息
   *
   * @param params - 要更新的字段
   */
  updateUserInfo: async (params: UpdateUserParams) => {
    try {
      set({ isLoading: true })

      const updatedUserInfo = await authService.updateUserInfo(params)

      // 保存到本地存储
      saveUserInfo(updatedUserInfo)

      // 更新状态
      set({ userInfo: updatedUserInfo })

      // 显示成功提示
      Taro.showToast({
        title: '更新成功',
        icon: 'success',
        duration: 1500,
      })
    } catch (error: any) {
      const errorMessage = error.message || '更新失败'
      set({ error: errorMessage })

      Taro.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 2000,
      })

      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  /**
   * 清除错误
   */
  clearError: () => {
    set({ error: null })
  },

  /**
   * 设置加载状态
   */
  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },

  /**
   * 设置用户统计数据
   */
  setUserStats: (stats: UserStats) => {
    set({ userStats: stats })
  },
}))

// ==================== 选择器 ====================

/**
 * 选择器：获取登录状态
 */
export const selectIsLoggedIn = (state: UserStore) => state.isLoggedIn

/**
 * 选择器：获取用户信息
 */
export const selectUserInfo = (state: UserStore) => state.userInfo

/**
 * 选择器：获取用户统计
 */
export const selectUserStats = (state: UserStore) => state.userStats

/**
 * 选择器：获取加载状态
 */
export const selectIsLoading = (state: UserStore) => state.isLoading

/**
 * 选择器：获取错误信息
 */
export const selectError = (state: UserStore) => state.error

// ==================== 辅助Hook ====================

/**
 * 获取认证状态的Hook
 * 返回常用的认证相关状态和方法
 */
export function useAuth() {
  const {
    isLoggedIn,
    isLoading,
    isInitialized,
    userInfo,
    userStats,
    error,
    login,
    logout,
    initialize,
    clearError,
  } = useUserStore()

  return {
    isLoggedIn,
    isLoading,
    isInitialized,
    userInfo,
    userStats,
    error,
    login,
    logout,
    initialize,
    clearError,
  }
}

/**
 * 仅获取用户信息的Hook
 */
export function useUserInfo() {
  return useUserStore((state) => ({
    userInfo: state.userInfo,
    userStats: state.userStats,
    isLoggedIn: state.isLoggedIn,
  }))
}

export default useUserStore
