/**
 * 用户状态管理
 */

import { create } from 'zustand'
import type { UserDetail } from '@/types/user'
import { userService, setToken, clearToken } from '@/services'

interface UserState {
  /** 是否已登录 */
  isLogin: boolean
  /** 当前用户信息 */
  userInfo: UserDetail | null
  /** 登录 */
  login: (code: string) => Promise<void>
  /** 退出登录 */
  logout: () => Promise<void>
  /** 获取用户信息 */
  fetchUserInfo: () => Promise<void>
  /** 更新用户信息 */
  updateUserInfo: (info: Partial<UserDetail>) => void
}

export const useUserStore = create<UserState>((set, get) => ({
  isLogin: false,
  userInfo: null,

  login: async (code: string) => {
    const result = await userService.login({ code })
    setToken(result.token)
    set({
      isLogin: true,
      userInfo: result.userInfo as UserDetail
    })
  },

  logout: async () => {
    await userService.logout()
    clearToken()
    set({
      isLogin: false,
      userInfo: null
    })
  },

  fetchUserInfo: async () => {
    const userInfo = await userService.getCurrentUser()
    set({
      isLogin: true,
      userInfo
    })
  },

  updateUserInfo: (info: Partial<UserDetail>) => {
    const currentInfo = get().userInfo
    if (currentInfo) {
      set({
        userInfo: { ...currentInfo, ...info }
      })
    }
  }
}))
