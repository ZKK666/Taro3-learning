/**
 * 本地存储工具
 */

import Taro from '@tarojs/taro'

/**
 * 存储数据
 */
export function setStorage<T>(key: string, value: T): void {
  try {
    Taro.setStorageSync(key, JSON.stringify(value))
  } catch (e) {
    console.error('setStorage error:', e)
  }
}

/**
 * 获取数据
 */
export function getStorage<T>(key: string, defaultValue?: T): T | undefined {
  try {
    const value = Taro.getStorageSync(key)
    if (value) {
      return JSON.parse(value) as T
    }
    return defaultValue
  } catch (e) {
    console.error('getStorage error:', e)
    return defaultValue
  }
}

/**
 * 移除数据
 */
export function removeStorage(key: string): void {
  try {
    Taro.removeStorageSync(key)
  } catch (e) {
    console.error('removeStorage error:', e)
  }
}

/**
 * 清空所有数据
 */
export function clearStorage(): void {
  try {
    Taro.clearStorageSync()
  } catch (e) {
    console.error('clearStorage error:', e)
  }
}

// 常用存储 Key
export const StorageKeys = {
  TOKEN: 'auth_token',
  USER_INFO: 'user_info',
  SEARCH_HISTORY: 'search_history',
  DRAFT_VIDEO: 'draft_video'
}
