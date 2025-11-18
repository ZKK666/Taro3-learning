/**
 * 安全区域工具
 *
 * 统一处理刘海屏、底部安全区等适配问题
 * 提供一致的边距计算，避免内容被遮挡
 *
 * 【使用方式】
 * 1. 在组件中使用 useSafeArea hook
 * 2. 使用返回的 safeArea 对象设置样式
 * 3. 或者直接使用 getSafeAreaStyle 获取样式对象
 */

import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'

// ==================== 类型定义 ====================

export interface SafeAreaInsets {
  /** 顶部安全区域高度（包含状态栏和刘海） */
  top: number
  /** 底部安全区域高度（处理底部横条） */
  bottom: number
  /** 左侧安全区域 */
  left: number
  /** 右侧安全区域 */
  right: number
}

export interface SafeAreaInfo extends SafeAreaInsets {
  /** 状态栏高度 */
  statusBarHeight: number
  /** 导航栏高度（不含状态栏） */
  navBarHeight: number
  /** 完整导航栏高度（状态栏+导航栏） */
  navBarFullHeight: number
  /** 屏幕宽度 */
  screenWidth: number
  /** 屏幕高度 */
  screenHeight: number
  /** 可用区域高度（去除安全区） */
  safeHeight: number
  /** 是否为刘海屏 */
  hasNotch: boolean
}

// ==================== 默认值 ====================

const defaultSafeArea: SafeAreaInfo = {
  top: 44,
  bottom: 34,
  left: 0,
  right: 0,
  statusBarHeight: 20,
  navBarHeight: 44,
  navBarFullHeight: 64,
  screenWidth: 375,
  screenHeight: 812,
  safeHeight: 734,
  hasNotch: true,
}

// ==================== 缓存 ====================

let cachedSafeArea: SafeAreaInfo | null = null

// ==================== 核心函数 ====================

/**
 * 获取安全区域信息
 * 同步获取，使用缓存提高性能
 */
export function getSafeAreaInfo(): SafeAreaInfo {
  if (cachedSafeArea) {
    return cachedSafeArea
  }

  try {
    const systemInfo = Taro.getSystemInfoSync()
    const menuButtonInfo = Taro.getMenuButtonBoundingClientRect?.() || {
      top: systemInfo.statusBarHeight || 20,
      height: 32,
    }

    // 计算各项数值
    const statusBarHeight = systemInfo.statusBarHeight || 20
    const navBarHeight = menuButtonInfo.height + (menuButtonInfo.top - statusBarHeight) * 2
    const navBarFullHeight = statusBarHeight + navBarHeight

    // 安全区域
    const safeArea = systemInfo.safeArea || {
      top: statusBarHeight,
      bottom: systemInfo.screenHeight,
      left: 0,
      right: systemInfo.screenWidth,
      height: systemInfo.screenHeight - statusBarHeight,
      width: systemInfo.screenWidth,
    }

    // 判断是否刘海屏（顶部安全区域大于状态栏高度）
    const hasNotch = safeArea.top > statusBarHeight ||
                     (systemInfo.screenHeight - safeArea.bottom) > 0

    cachedSafeArea = {
      top: safeArea.top,
      bottom: systemInfo.screenHeight - safeArea.bottom,
      left: safeArea.left,
      right: systemInfo.screenWidth - safeArea.right,
      statusBarHeight,
      navBarHeight,
      navBarFullHeight,
      screenWidth: systemInfo.screenWidth,
      screenHeight: systemInfo.screenHeight,
      safeHeight: safeArea.height,
      hasNotch,
    }

    return cachedSafeArea
  } catch (error) {
    console.warn('获取安全区域信息失败，使用默认值', error)
    return defaultSafeArea
  }
}

/**
 * React Hook - 获取安全区域信息
 */
export function useSafeArea(): SafeAreaInfo {
  const [safeArea, setSafeArea] = useState<SafeAreaInfo>(getSafeAreaInfo)

  useEffect(() => {
    // 确保在客户端获取最新信息
    setSafeArea(getSafeAreaInfo())
  }, [])

  return safeArea
}

// ==================== 样式辅助函数 ====================

/**
 * 获取顶部安全区域样式
 * @param extra 额外的顶部边距
 */
export function getTopSafeStyle(extra: number = 0): React.CSSProperties {
  const { top } = getSafeAreaInfo()
  return {
    paddingTop: `${top + extra}px`,
  }
}

/**
 * 获取底部安全区域样式
 * @param extra 额外的底部边距
 */
export function getBottomSafeStyle(extra: number = 0): React.CSSProperties {
  const { bottom } = getSafeAreaInfo()
  return {
    paddingBottom: `${bottom + extra}px`,
  }
}

/**
 * 获取完整安全区域样式
 */
export function getSafeAreaStyle(): React.CSSProperties {
  const { top, bottom, left, right } = getSafeAreaInfo()
  return {
    paddingTop: `${top}px`,
    paddingBottom: `${bottom}px`,
    paddingLeft: `${left}px`,
    paddingRight: `${right}px`,
  }
}

/**
 * 转换rpx到px（基于750设计稿）
 */
export function rpxToPx(rpx: number): number {
  const { screenWidth } = getSafeAreaInfo()
  return (rpx / 750) * screenWidth
}

/**
 * 转换px到rpx
 */
export function pxToRpx(px: number): number {
  const { screenWidth } = getSafeAreaInfo()
  return (px / screenWidth) * 750
}

// ==================== 常用位置计算 ====================

/**
 * 计算弹幕区域位置
 * 避开顶部导航和底部操作栏
 */
export function getDanmakuArea(): { top: number; height: number } {
  const { navBarFullHeight, screenHeight, bottom } = getSafeAreaInfo()
  const topOffset = navBarFullHeight + 20 // 导航栏下方20px
  const bottomOffset = 200 + bottom // 底部操作栏高度

  return {
    top: topOffset,
    height: screenHeight - topOffset - bottomOffset,
  }
}

/**
 * 计算直播间消息列表位置
 */
export function getLiveMessageArea(): { bottom: number; maxHeight: number } {
  const { bottom, screenHeight } = getSafeAreaInfo()
  const inputBarHeight = 120 // 底部输入栏高度

  return {
    bottom: inputBarHeight + bottom,
    maxHeight: screenHeight * 0.35, // 最多占屏幕35%
  }
}

/**
 * 计算全屏视频区域
 */
export function getFullScreenArea(): { width: number; height: number } {
  const { screenWidth, screenHeight } = getSafeAreaInfo()
  return {
    width: screenWidth,
    height: screenHeight,
  }
}

export default {
  getSafeAreaInfo,
  useSafeArea,
  getTopSafeStyle,
  getBottomSafeStyle,
  getSafeAreaStyle,
  rpxToPx,
  pxToRpx,
  getDanmakuArea,
  getLiveMessageArea,
  getFullScreenArea,
}
