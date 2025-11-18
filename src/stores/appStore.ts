/**
 * 应用全局状态管理
 */

import { create } from 'zustand'
import Taro from '@tarojs/taro'

interface SystemInfo {
  /** 屏幕宽度 */
  screenWidth: number
  /** 屏幕高度 */
  screenHeight: number
  /** 窗口宽度 */
  windowWidth: number
  /** 窗口高度 */
  windowHeight: number
  /** 状态栏高度 */
  statusBarHeight: number
  /** 底部安全区域高度 */
  safeAreaBottom: number
  /** 设备像素比 */
  pixelRatio: number
}

interface AppState {
  /** 系统信息 */
  systemInfo: SystemInfo
  /** 网络状态 */
  networkType: string
  /** 是否初始化完成 */
  initialized: boolean
  /** 初始化应用 */
  initApp: () => Promise<void>
  /** 更新网络状态 */
  setNetworkType: (type: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  systemInfo: {
    screenWidth: 375,
    screenHeight: 667,
    windowWidth: 375,
    windowHeight: 667,
    statusBarHeight: 20,
    safeAreaBottom: 0,
    pixelRatio: 2
  },
  networkType: 'wifi',
  initialized: false,

  initApp: async () => {
    // 获取系统信息
    const info = Taro.getSystemInfoSync()
    const systemInfo: SystemInfo = {
      screenWidth: info.screenWidth,
      screenHeight: info.screenHeight,
      windowWidth: info.windowWidth,
      windowHeight: info.windowHeight,
      statusBarHeight: info.statusBarHeight || 20,
      safeAreaBottom: info.safeAreaInsets?.bottom || 0,
      pixelRatio: info.pixelRatio
    }

    // 获取网络状态
    const networkInfo = await Taro.getNetworkType()

    set({
      systemInfo,
      networkType: networkInfo.networkType,
      initialized: true
    })

    // 监听网络状态变化
    Taro.onNetworkStatusChange((res) => {
      set({ networkType: res.networkType })
    })
  },

  setNetworkType: (type: string) => {
    set({ networkType: type })
  }
}))
