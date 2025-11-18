/**
 * 认证服务层
 *
 * 封装所有与登录认证相关的API调用
 * 这是企业级架构中Service层的典型实现
 *
 * 【设计要点】
 * 1. 统一的API调用封装
 * 2. 错误处理和异常转换
 * 3. 支持Mock数据和真实API无缝切换
 * 4. 请求参数验证
 */

import Taro from '@tarojs/taro'
import {
  LoginParams,
  LoginResponse,
  SendCodeParams,
  SendCodeResponse,
  TokenInfo,
  UserInfo,
  UserStats,
  UpdateUserParams,
} from '@/types/user'
import {
  mockLoginWithParams,
  mockSendCode,
  mockRefreshToken,
  mockLoginUserStats,
} from '@/mock/user'
import { validatePhone, validateCode } from '@/utils/auth'

// ==================== 配置 ====================

/**
 * 是否使用Mock数据
 * 开发阶段使用Mock，生产环境切换为真实API
 */
const USE_MOCK = true

/**
 * API基础路径
 * 生产环境需要配置真实的后端地址
 */
const API_BASE_URL = 'https://api.example.com'

// ==================== 请求封装 ====================

/**
 * 发起HTTP请求
 * 统一的请求方法，包含错误处理
 *
 * @param options - 请求配置
 * @returns 响应数据
 */
async function request<T>(options: {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
}): Promise<T> {
  const { url, method = 'GET', data, header = {} } = options

  try {
    const response = await Taro.request({
      url: `${API_BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header,
      },
    })

    // 检查HTTP状态码
    if (response.statusCode !== 200) {
      throw new Error(`HTTP Error: ${response.statusCode}`)
    }

    // 检查业务状态码
    const result = response.data as { code: number; message: string; data: T }
    if (result.code !== 0) {
      throw new Error(result.message || '请求失败')
    }

    return result.data
  } catch (error: any) {
    // 统一错误处理
    console.error('API请求失败:', error)
    throw new Error(error.message || '网络请求失败，请稍后重试')
  }
}

// ==================== 认证相关API ====================

/**
 * 发送验证码
 *
 * @param params - 发送验证码参数
 * @returns 发送结果
 *
 * @example
 * ```typescript
 * const result = await authService.sendCode({
 *   phone: '13800138000',
 *   type: 'login'
 * })
 * ```
 */
export async function sendCode(params: SendCodeParams): Promise<SendCodeResponse> {
  const { phone, type } = params

  // 参数验证
  if (!validatePhone(phone)) {
    throw new Error('请输入正确的手机号')
  }

  if (USE_MOCK) {
    // 使用Mock数据
    return mockSendCode(phone, type)
  }

  // 真实API调用
  return request<SendCodeResponse>({
    url: '/auth/send-code',
    method: 'POST',
    data: params,
  })
}

/**
 * 用户登录
 *
 * @param params - 登录参数
 * @returns 登录响应（用户信息+Token）
 *
 * @example
 * ```typescript
 * // 验证码登录
 * const result = await authService.login({
 *   type: 'phone_code',
 *   phone: '13800138000',
 *   code: '123456'
 * })
 *
 * // 密码登录
 * const result = await authService.login({
 *   type: 'phone_password',
 *   phone: '13800138000',
 *   password: '123456'
 * })
 *
 * // 微信登录
 * const result = await authService.login({
 *   type: 'wechat',
 *   code: 'wx_code_xxx'
 * })
 * ```
 */
export async function login(params: LoginParams): Promise<LoginResponse> {
  // 参数验证
  if (params.type === 'phone_code' || params.type === 'phone_password') {
    if (!validatePhone(params.phone)) {
      throw new Error('请输入正确的手机号')
    }

    if (params.type === 'phone_code' && !validateCode(params.code)) {
      throw new Error('请输入6位验证码')
    }

    if (params.type === 'phone_password' && !params.password) {
      throw new Error('请输入密码')
    }
  }

  if (USE_MOCK) {
    // 使用Mock数据
    return mockLoginWithParams(params)
  }

  // 真实API调用
  return request<LoginResponse>({
    url: '/auth/login',
    method: 'POST',
    data: params,
  })
}

/**
 * 刷新Token
 *
 * @param refreshToken - 刷新Token
 * @returns 新的Token信息
 */
export async function refreshToken(refreshToken: string): Promise<TokenInfo> {
  if (!refreshToken) {
    throw new Error('刷新Token不能为空')
  }

  if (USE_MOCK) {
    return mockRefreshToken(refreshToken)
  }

  return request<TokenInfo>({
    url: '/auth/refresh-token',
    method: 'POST',
    data: { refreshToken },
  })
}

/**
 * 用户登出
 * 清除服务端的Token记录
 */
export async function logout(): Promise<void> {
  if (USE_MOCK) {
    // Mock模式直接返回
    console.log('【Mock】用户登出')
    return
  }

  await request<void>({
    url: '/auth/logout',
    method: 'POST',
  })
}

/**
 * 微信登录获取code
 * 封装Taro.login
 *
 * @returns 微信code
 */
export async function getWxLoginCode(): Promise<string> {
  try {
    const res = await Taro.login()
    if (res.code) {
      return res.code
    }
    throw new Error('获取微信code失败')
  } catch (error: any) {
    throw new Error(error.message || '微信登录失败')
  }
}

/**
 * 获取微信用户信息
 * 需要用户授权
 *
 * @returns 用户信息
 */
export async function getWxUserProfile(): Promise<{
  nickName: string
  avatarUrl: string
  gender: number
}> {
  try {
    const res = await Taro.getUserProfile({
      desc: '用于完善用户资料',
    })
    return {
      nickName: res.userInfo.nickName,
      avatarUrl: res.userInfo.avatarUrl,
      gender: res.userInfo.gender,
    }
  } catch (error: any) {
    throw new Error(error.message || '获取用户信息失败')
  }
}

// ==================== 用户信息相关API ====================

/**
 * 获取当前用户信息
 *
 * @returns 用户信息和统计数据
 */
export async function getCurrentUserInfo(): Promise<{
  userInfo: UserInfo
  stats: UserStats
}> {
  if (USE_MOCK) {
    // Mock模式返回默认用户
    const userInfo: UserInfo = {
      id: 'user_test_001',
      nickname: '抖音小达人',
      avatarUrl: 'https://picsum.photos/200/200?random=login1',
      bio: '热爱生活，记录美好瞬间',
      gender: 1,
      birthday: '1995-06-15',
      region: '北京市',
      uniqueId: 'douyin_001',
      phone: '138****8000',
      isFollowed: false,
      isFriend: false,
      isVerified: false,
      verifyInfo: '',
    }

    return {
      userInfo,
      stats: mockLoginUserStats['user_test_001'],
    }
  }

  return request<{ userInfo: UserInfo; stats: UserStats }>({
    url: '/user/current',
    method: 'GET',
  })
}

/**
 * 更新用户信息
 *
 * @param params - 要更新的字段
 * @returns 更新后的用户信息
 */
export async function updateUserInfo(params: UpdateUserParams): Promise<UserInfo> {
  if (USE_MOCK) {
    // Mock模式直接返回更新后的信息
    console.log('【Mock】更新用户信息:', params)
    return {
      id: 'user_test_001',
      nickname: params.nickname || '抖音小达人',
      avatarUrl: params.avatarUrl || 'https://picsum.photos/200/200?random=login1',
      bio: params.bio || '热爱生活，记录美好瞬间',
      gender: params.gender ?? 1,
      birthday: params.birthday || '1995-06-15',
      region: params.region || '北京市',
      uniqueId: 'douyin_001',
      phone: '138****8000',
      isFollowed: false,
      isFriend: false,
      isVerified: false,
      verifyInfo: '',
    }
  }

  return request<UserInfo>({
    url: '/user/update',
    method: 'PUT',
    data: params,
  })
}

/**
 * 检查手机号是否已注册
 *
 * @param phone - 手机号
 * @returns 是否已注册
 */
export async function checkPhoneRegistered(phone: string): Promise<boolean> {
  if (!validatePhone(phone)) {
    throw new Error('请输入正确的手机号')
  }

  if (USE_MOCK) {
    // Mock模式：预设的手机号为已注册
    const registeredPhones = ['13800138000', '13900139000', '13700137000']
    return registeredPhones.includes(phone)
  }

  const result = await request<{ registered: boolean }>({
    url: '/auth/check-phone',
    method: 'GET',
    data: { phone },
  })

  return result.registered
}

// ==================== 导出服务对象 ====================

/**
 * 认证服务
 * 统一导出所有认证相关的API方法
 */
export const authService = {
  sendCode,
  login,
  refreshToken,
  logout,
  getWxLoginCode,
  getWxUserProfile,
  getCurrentUserInfo,
  updateUserInfo,
  checkPhoneRegistered,
}

export default authService
