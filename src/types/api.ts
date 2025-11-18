/**
 * API 通用类型定义
 */

/** API 响应基础结构 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

/** 分页请求参数 */
export interface PaginationParams {
  page: number
  pageSize: number
}

/** 分页响应数据 */
export interface PaginationData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

/** 请求配置 */
export interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, any>
  header?: Record<string, string>
  timeout?: number
  showLoading?: boolean
  showError?: boolean
}

/** 上传文件配置 */
export interface UploadConfig {
  url: string
  filePath: string
  name: string
  formData?: Record<string, any>
}
