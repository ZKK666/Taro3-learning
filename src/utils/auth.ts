/**
 * 认证工具函数
 *
 * 提供Token管理、登录状态检查等核心功能
 * 这是企业级登录模块的基础设施层
 */

import Taro from '@tarojs/taro'
import { TokenInfo, UserInfo } from '@/types/user'
import { getStorage, setStorage, removeStorage } from './storage'

// ==================== 存储Key常量 ====================

/**
 * 认证相关的存储Key
 * 集中管理便于维护和避免Key冲突
 */
export const AUTH_STORAGE_KEYS = {
  /** Token信息 */
  TOKEN_INFO: 'auth_token_info',
  /** 用户信息 */
  USER_INFO: 'auth_user_info',
  /** 记住的手机号（用于下次登录自动填充） */
  REMEMBERED_PHONE: 'auth_remembered_phone',
  /** 登录方式偏好 */
  LOGIN_TYPE_PREFERENCE: 'auth_login_type',
  /** 设备ID（用于设备管理） */
  DEVICE_ID: 'auth_device_id',
}

// ==================== Token管理 ====================

/**
 * 保存Token信息到本地存储
 *
 * @param tokenInfo - Token信息对象
 *
 * @example
 * ```typescript
 * saveTokenInfo({
 *   accessToken: 'xxx',
 *   refreshToken: 'yyy',
 *   expiresAt: Date.now() + 7200000,
 *   refreshExpiresAt: Date.now() + 604800000
 * })
 * ```
 */
export function saveTokenInfo(tokenInfo: TokenInfo): void {
  setStorage(AUTH_STORAGE_KEYS.TOKEN_INFO, tokenInfo)
}

/**
 * 获取本地存储的Token信息
 *
 * @returns Token信息，未登录时返回null
 */
export function getTokenInfo(): TokenInfo | null {
  return getStorage<TokenInfo>(AUTH_STORAGE_KEYS.TOKEN_INFO) || null
}

/**
 * 清除Token信息
 * 通常在登出或Token失效时调用
 */
export function clearTokenInfo(): void {
  removeStorage(AUTH_STORAGE_KEYS.TOKEN_INFO)
}

/**
 * 获取AccessToken
 * 便捷方法，直接返回accessToken字符串
 *
 * @returns accessToken字符串，未登录时返回空字符串
 */
export function getAccessToken(): string {
  const tokenInfo = getTokenInfo()
  return tokenInfo?.accessToken || ''
}

/**
 * 获取RefreshToken
 *
 * @returns refreshToken字符串，未登录时返回空字符串
 */
export function getRefreshToken(): string {
  const tokenInfo = getTokenInfo()
  return tokenInfo?.refreshToken || ''
}

// ==================== Token有效期检查 ====================

/**
 * 检查AccessToken是否过期
 *
 * @param bufferTime - 缓冲时间（毫秒），默认5分钟
 *                     提前刷新可以避免请求时刚好过期
 * @returns true表示已过期或即将过期
 *
 * @example
 * ```typescript
 * if (isAccessTokenExpired()) {
 *   await refreshToken()
 * }
 * ```
 */
export function isAccessTokenExpired(bufferTime: number = 5 * 60 * 1000): boolean {
  const tokenInfo = getTokenInfo()
  if (!tokenInfo) return true

  // 当前时间 + 缓冲时间 > 过期时间，则认为已过期
  return Date.now() + bufferTime > tokenInfo.expiresAt
}

/**
 * 检查RefreshToken是否过期
 * RefreshToken过期意味着用户需要重新登录
 *
 * @returns true表示已过期
 */
export function isRefreshTokenExpired(): boolean {
  const tokenInfo = getTokenInfo()
  if (!tokenInfo) return true

  return Date.now() > tokenInfo.refreshExpiresAt
}

/**
 * 检查是否需要刷新Token
 * 综合判断：有Token + AccessToken过期 + RefreshToken未过期
 *
 * @returns true表示需要刷新
 */
export function needRefreshToken(): boolean {
  const tokenInfo = getTokenInfo()
  if (!tokenInfo) return false

  return isAccessTokenExpired() && !isRefreshTokenExpired()
}

/**
 * 获取Token剩余有效时间
 *
 * @returns 剩余毫秒数，已过期返回0
 */
export function getTokenRemainingTime(): number {
  const tokenInfo = getTokenInfo()
  if (!tokenInfo) return 0

  const remaining = tokenInfo.expiresAt - Date.now()
  return remaining > 0 ? remaining : 0
}

// ==================== 用户信息管理 ====================

/**
 * 保存用户信息到本地存储
 *
 * @param userInfo - 用户信息对象
 */
export function saveUserInfo(userInfo: UserInfo): void {
  setStorage(AUTH_STORAGE_KEYS.USER_INFO, userInfo)
}

/**
 * 获取本地存储的用户信息
 *
 * @returns 用户信息，未登录时返回null
 */
export function getUserInfo(): UserInfo | null {
  return getStorage<UserInfo>(AUTH_STORAGE_KEYS.USER_INFO) || null
}

/**
 * 清除用户信息
 */
export function clearUserInfo(): void {
  removeStorage(AUTH_STORAGE_KEYS.USER_INFO)
}

/**
 * 更新用户信息（部分更新）
 *
 * @param updates - 要更新的字段
 */
export function updateUserInfo(updates: Partial<UserInfo>): void {
  const currentInfo = getUserInfo()
  if (currentInfo) {
    saveUserInfo({ ...currentInfo, ...updates })
  }
}

// ==================== 登录状态检查 ====================

/**
 * 检查用户是否已登录
 * 判断条件：有Token信息 + RefreshToken未过期
 *
 * @returns true表示已登录
 */
export function isLoggedIn(): boolean {
  const tokenInfo = getTokenInfo()
  if (!tokenInfo) return false

  // RefreshToken过期则认为未登录
  return !isRefreshTokenExpired()
}

/**
 * 检查登录状态并获取用户信息
 * 综合检查Token和用户信息
 *
 * @returns 登录状态和用户信息
 */
export function checkAuthStatus(): {
  isLoggedIn: boolean
  userInfo: UserInfo | null
  tokenInfo: TokenInfo | null
  needRefresh: boolean
} {
  const tokenInfo = getTokenInfo()
  const userInfo = getUserInfo()

  return {
    isLoggedIn: isLoggedIn(),
    userInfo,
    tokenInfo,
    needRefresh: needRefreshToken(),
  }
}

// ==================== 清除所有认证数据 ====================

/**
 * 清除所有认证相关数据
 * 用于登出操作
 */
export function clearAuthData(): void {
  clearTokenInfo()
  clearUserInfo()
  removeStorage(AUTH_STORAGE_KEYS.LOGIN_TYPE_PREFERENCE)
  // 保留remembered_phone，方便下次登录
}

/**
 * 完全清除认证数据（包括记住的手机号）
 * 用于切换账号或清除所有数据
 */
export function clearAllAuthData(): void {
  clearAuthData()
  removeStorage(AUTH_STORAGE_KEYS.REMEMBERED_PHONE)
  removeStorage(AUTH_STORAGE_KEYS.DEVICE_ID)
}

// ==================== 手机号记忆功能 ====================

/**
 * 保存记住的手机号
 *
 * @param phone - 手机号
 */
export function saveRememberedPhone(phone: string): void {
  setStorage(AUTH_STORAGE_KEYS.REMEMBERED_PHONE, phone)
}

/**
 * 获取记住的手机号
 *
 * @returns 手机号，无则返回空字符串
 */
export function getRememberedPhone(): string {
  return getStorage<string>(AUTH_STORAGE_KEYS.REMEMBERED_PHONE) || ''
}

/**
 * 清除记住的手机号
 */
export function clearRememberedPhone(): void {
  removeStorage(AUTH_STORAGE_KEYS.REMEMBERED_PHONE)
}

// ==================== 设备ID管理 ====================

/**
 * 获取或生成设备ID
 * 设备ID用于：设备管理、异常登录检测、数据分析等
 *
 * @returns 设备ID
 */
export function getDeviceId(): string {
  let deviceId = getStorage<string>(AUTH_STORAGE_KEYS.DEVICE_ID)

  if (!deviceId) {
    // 生成唯一设备ID
    deviceId = generateDeviceId()
    setStorage(AUTH_STORAGE_KEYS.DEVICE_ID, deviceId)
  }

  return deviceId
}

/**
 * 生成设备ID
 * 使用时间戳 + 随机数 + 系统信息生成
 */
function generateDeviceId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)

  // 尝试获取系统信息
  let systemInfo = ''
  try {
    const info = Taro.getSystemInfoSync()
    systemInfo = `${info.brand || ''}_${info.model || ''}`.substring(0, 10)
  } catch (e) {
    systemInfo = 'unknown'
  }

  return `${timestamp}_${random}_${systemInfo}`
}

// ==================== 校验工具 ====================

/**
 * 校验手机号格式
 *
 * @param phone - 手机号
 * @returns true表示格式正确
 */
export function validatePhone(phone: string): boolean {
  // 中国大陆手机号：1开头，第二位3-9，共11位
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 校验验证码格式
 *
 * @param code - 验证码
 * @param length - 验证码长度，默认6位
 * @returns true表示格式正确
 */
export function validateCode(code: string, length: number = 6): boolean {
  const codeRegex = new RegExp(`^\\d{${length}}$`)
  return codeRegex.test(code)
}

/**
 * 校验密码强度
 *
 * @param password - 密码
 * @returns 校验结果
 */
export function validatePassword(password: string): {
  isValid: boolean
  message: string
  strength: 'weak' | 'medium' | 'strong'
} {
  if (password.length < 6) {
    return {
      isValid: false,
      message: '密码长度至少6位',
      strength: 'weak',
    }
  }

  if (password.length > 20) {
    return {
      isValid: false,
      message: '密码长度不能超过20位',
      strength: 'weak',
    }
  }

  // 检查密码强度
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  const complexity = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length

  if (complexity >= 3 && password.length >= 8) {
    strength = 'strong'
  } else if (complexity >= 2) {
    strength = 'medium'
  }

  return {
    isValid: true,
    message: strength === 'weak' ? '密码强度较弱，建议包含字母、数字和特殊字符' : '密码格式正确',
    strength,
  }
}

/**
 * 手机号脱敏显示
 *
 * @param phone - 完整手机号
 * @returns 脱敏后的手机号，如 138****8888
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length !== 11) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// ==================== 路由守卫辅助 ====================

/**
 * 需要登录的页面路径列表
 * 访问这些页面时会检查登录状态
 */
export const PROTECTED_PAGES = [
  '/pages/profile/index',
  '/packageSettings/pages/account/index',
  '/packageSettings/pages/privacy/index',
  '/pages/publish/index',
]

/**
 * 登录页面路径
 */
export const LOGIN_PAGE = '/pages/login/index'

/**
 * 检查页面是否需要登录
 *
 * @param pagePath - 页面路径
 * @returns true表示需要登录
 */
export function isProtectedPage(pagePath: string): boolean {
  return PROTECTED_PAGES.some((p) => pagePath.startsWith(p))
}

/**
 * 跳转到登录页
 *
 * @param redirectUrl - 登录后跳转的页面，默认返回当前页
 */
export function navigateToLogin(redirectUrl?: string): void {
  const currentPages = Taro.getCurrentPages()
  const currentPage = currentPages[currentPages.length - 1]
  const redirect = redirectUrl || `/${currentPage?.route || ''}`

  Taro.navigateTo({
    url: `${LOGIN_PAGE}?redirect=${encodeURIComponent(redirect)}`,
  })
}

/**
 * 登录成功后跳转
 *
 * @param redirectUrl - 目标页面，默认返回首页
 */
export function navigateAfterLogin(redirectUrl?: string): void {
  if (redirectUrl) {
    // 使用redirectTo避免返回到登录页
    Taro.redirectTo({ url: redirectUrl })
  } else {
    // 返回首页
    Taro.switchTab({ url: '/pages/index/index' })
  }
}

// ==================== 请求拦截器辅助 ====================

/**
 * 生成带Token的请求头
 *
 * @returns 请求头对象
 */
export function getAuthHeaders(): Record<string, string> {
  const accessToken = getAccessToken()
  const deviceId = getDeviceId()

  return {
    Authorization: accessToken ? `Bearer ${accessToken}` : '',
    'X-Device-Id': deviceId,
  }
}

/**
 * Token刷新锁
 * 防止多个请求同时刷新Token
 */
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

/**
 * 订阅Token刷新完成事件
 */
export function subscribeTokenRefresh(callback: (token: string) => void): void {
  refreshSubscribers.push(callback)
}

/**
 * 通知所有订阅者Token已刷新
 */
export function notifyTokenRefreshed(token: string): void {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

/**
 * 获取刷新状态
 */
export function getIsRefreshing(): boolean {
  return isRefreshing
}

/**
 * 设置刷新状态
 */
export function setIsRefreshing(value: boolean): void {
  isRefreshing = value
}
