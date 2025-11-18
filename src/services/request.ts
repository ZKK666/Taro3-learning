/**
 * 统一请求封装
 * 支持 Mock 模式和真实 API 模式
 */

import Taro from '@tarojs/taro'
import type { ApiResponse, RequestConfig } from '@/types/api'
import { mockDispatcher } from '@/mock'

// 环境变量
declare const IS_MOCK: boolean
declare const API_BASE_URL: string

/** 请求默认配置 */
const DEFAULT_CONFIG = {
  timeout: 30000,
  showLoading: true,
  showError: true
}

/** Token 存储 Key */
const TOKEN_KEY = 'auth_token'

/** 获取 Token */
const getToken = (): string => {
  return Taro.getStorageSync(TOKEN_KEY) || ''
}

/** 设置 Token */
export const setToken = (token: string): void => {
  Taro.setStorageSync(TOKEN_KEY, token)
}

/** 清除 Token */
export const clearToken = (): void => {
  Taro.removeStorageSync(TOKEN_KEY)
}

/** 显示加载提示 */
const showLoading = (show: boolean): void => {
  if (show) {
    Taro.showLoading({
      title: '加载中...',
      mask: true
    })
  }
}

/** 隐藏加载提示 */
const hideLoading = (show: boolean): void => {
  if (show) {
    Taro.hideLoading()
  }
}

/** 显示错误提示 */
const showError = (message: string, show: boolean): void => {
  if (show) {
    Taro.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    })
  }
}

/** 处理业务错误码 */
const handleBusinessError = (code: number, message: string): void => {
  switch (code) {
    case 401:
      // Token 过期，跳转登录
      clearToken()
      Taro.navigateTo({ url: '/pages/login/index' })
      break
    case 403:
      showError('无权限访问', true)
      break
    default:
      showError(message || '请求失败', true)
  }
}

/**
 * 核心请求方法
 */
export async function request<T = any>(config: RequestConfig): Promise<T> {
  const {
    url,
    method = 'GET',
    data,
    header = {},
    timeout = DEFAULT_CONFIG.timeout,
    showLoading: loading = DEFAULT_CONFIG.showLoading,
    showError: error = DEFAULT_CONFIG.showError
  } = config

  showLoading(loading)

  try {
    let response: ApiResponse<T>

    // Mock 模式
    if (IS_MOCK) {
      response = await mockDispatcher<T>({
        url,
        method,
        data
      })
    } else {
      // 真实请求模式
      const token = getToken()
      const requestHeader = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...header
      }

      const res = await Taro.request({
        url: `${API_BASE_URL}${url}`,
        method,
        data,
        header: requestHeader,
        timeout
      })

      response = res.data as ApiResponse<T>
    }

    hideLoading(loading)

    // 处理业务状态码
    if (response.code === 0) {
      return response.data
    } else {
      handleBusinessError(response.code, response.message)
      throw new Error(response.message)
    }
  } catch (err: any) {
    hideLoading(loading)

    const message = err.message || '网络请求失败'
    showError(message, error)

    throw err
  }
}

/** GET 请求 */
export function get<T = any>(url: string, data?: Record<string, any>, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({
    url,
    method: 'GET',
    data,
    ...config
  })
}

/** POST 请求 */
export function post<T = any>(url: string, data?: Record<string, any>, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({
    url,
    method: 'POST',
    data,
    ...config
  })
}

/** PUT 请求 */
export function put<T = any>(url: string, data?: Record<string, any>, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({
    url,
    method: 'PUT',
    data,
    ...config
  })
}

/** DELETE 请求 */
export function del<T = any>(url: string, data?: Record<string, any>, config?: Partial<RequestConfig>): Promise<T> {
  return request<T>({
    url,
    method: 'DELETE',
    data,
    ...config
  })
}

export default {
  request,
  get,
  post,
  put,
  del,
  setToken,
  clearToken
}
