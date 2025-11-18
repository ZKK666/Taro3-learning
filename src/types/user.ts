/**
 * 用户相关类型定义
 *
 * 企业级登录模块的核心类型，包含用户信息、登录请求/响应、Token管理等
 * 这些类型定义是整个登录模块的基础，确保类型安全和代码提示
 */

// ==================== 用户信息相关 ====================

/** 用户基础信息 */
export interface UserInfo {
  id: string
  /** 用户昵称 */
  nickname: string
  /** 头像 URL */
  avatarUrl: string
  /** 个人简介 */
  bio: string
  /** 性别: 0-未知, 1-男, 2-女 */
  gender: 0 | 1 | 2
  /** 生日 */
  birthday: string
  /** 地区 */
  region: string
  /** 抖音号 */
  uniqueId: string
  /** 手机号（脱敏显示，如 138****8888） */
  phone?: string
  /** 是否已关注 */
  isFollowed: boolean
  /** 是否是好友（互相关注） */
  isFriend: boolean
  /** 是否是官方认证 */
  isVerified: boolean
  /** 认证信息 */
  verifyInfo: string
  /** 账号创建时间 */
  createdAt?: string
  /** 最后登录时间 */
  lastLoginAt?: string
}

/** 用户统计数据 */
export interface UserStats {
  /** 关注数 */
  followingCount: number
  /** 粉丝数 */
  followerCount: number
  /** 获赞数 */
  likeCount: number
  /** 作品数 */
  worksCount: number
  /** 喜欢数（点赞的视频数） */
  likesCount: number
}

/** 用户详情（包含统计） */
export interface UserDetail extends UserInfo {
  stats: UserStats
}

/** 关注/粉丝列表项 */
export interface FollowItem {
  user: UserInfo
  /** 关注时间 */
  followTime: string
  /** 互相关注状态 */
  isMutual: boolean
}

/** 用户列表请求参数 */
export interface UserListParams {
  userId: string
  /** 类型: following-关注列表, followers-粉丝列表 */
  type: 'following' | 'followers'
  page: number
  pageSize: number
}

// ==================== 登录认证相关 ====================

/**
 * 登录方式枚举
 * 企业级应用通常支持多种登录方式
 */
export type LoginType =
  | 'phone_code'      // 手机号+验证码登录（最常用）
  | 'phone_password'  // 手机号+密码登录
  | 'wechat'          // 微信一键登录（小程序专用）

/**
 * 手机号+验证码登录请求参数
 * 这是最安全的登录方式，验证码有效期短，每次登录需重新获取
 */
export interface PhoneCodeLoginParams {
  /** 登录方式标识 */
  type: 'phone_code'
  /** 手机号（11位） */
  phone: string
  /** 短信验证码（通常6位） */
  code: string
}

/**
 * 手机号+密码登录请求参数
 * 传统登录方式，需要配合密码强度校验和登录失败次数限制
 */
export interface PhonePasswordLoginParams {
  /** 登录方式标识 */
  type: 'phone_password'
  /** 手机号（11位） */
  phone: string
  /** 密码（应在前端进行MD5或SHA256加密后传输） */
  password: string
}

/**
 * 微信登录请求参数
 * 小程序专用登录方式，通过wx.login获取code
 */
export interface WechatLoginParams {
  /** 登录方式标识 */
  type: 'wechat'
  /** 微信授权code（通过wx.login获取，5分钟内有效） */
  code: string
  /** 用户信息（通过getUserProfile获取，首次登录时需要） */
  userInfo?: {
    nickName: string
    avatarUrl: string
    gender: number
  }
}

/**
 * 登录请求参数联合类型
 * 使用联合类型可以根据type字段自动推断其他字段
 */
export type LoginParams =
  | PhoneCodeLoginParams
  | PhonePasswordLoginParams
  | WechatLoginParams

/**
 * Token信息
 *
 * 采用双Token机制（OAuth2.0标准）：
 * - accessToken: 短期令牌，用于API请求认证，有效期通常15分钟-2小时
 * - refreshToken: 长期令牌，用于刷新accessToken，有效期通常7-30天
 *
 * 这种设计的优点：
 * 1. accessToken短期有效，即使泄露影响也有限
 * 2. refreshToken用于自动续期，用户体验好
 * 3. 可以实现无感刷新，用户无需重复登录
 */
export interface TokenInfo {
  /** 访问令牌，每次API请求都要携带 */
  accessToken: string
  /** 刷新令牌，仅用于获取新的accessToken */
  refreshToken: string
  /** accessToken过期时间戳（毫秒），用于判断是否需要刷新 */
  expiresAt: number
  /** refreshToken过期时间戳（毫秒），过期后需要重新登录 */
  refreshExpiresAt: number
}

/**
 * 登录响应数据
 * 登录成功后返回用户信息和Token
 */
export interface LoginResponse {
  /** 用户信息 */
  userInfo: UserInfo
  /** Token信息 */
  tokenInfo: TokenInfo
  /** 是否是新用户（用于引导流程） */
  isNewUser: boolean
}

/** 旧版登录响应（兼容） */
export interface LoginResult {
  token: string
  userInfo: UserInfo
  isNewUser: boolean
}

// ==================== 验证码相关 ====================

/**
 * 发送验证码请求参数
 */
export interface SendCodeParams {
  /** 手机号 */
  phone: string
  /** 验证码用途: login-登录, register-注册, reset-重置密码, bindPhone-绑定手机 */
  type: 'login' | 'register' | 'reset' | 'bindPhone'
}

/**
 * 发送验证码响应
 */
export interface SendCodeResponse {
  /** 是否发送成功 */
  success: boolean
  /** 验证码有效期（秒），通常为60-300秒 */
  expireSeconds: number
  /** 重新发送等待时间（秒），防止频繁发送 */
  retryAfter: number
  /** 提示信息 */
  message: string
}

// ==================== Token刷新相关 ====================

/**
 * 刷新Token请求参数
 */
export interface RefreshTokenParams {
  /** 刷新令牌 */
  refreshToken: string
}

/**
 * 刷新Token响应
 */
export interface RefreshTokenResponse {
  /** 新的访问令牌 */
  accessToken: string
  /** 新的刷新令牌（可选，部分系统会同时刷新） */
  refreshToken?: string
  /** 新的accessToken过期时间戳 */
  expiresAt: number
  /** 新的refreshToken过期时间戳（如果刷新了的话） */
  refreshExpiresAt?: number
}

// ==================== 密码相关 ====================

/**
 * 修改密码请求参数
 * 已登录用户修改密码
 */
export interface ChangePasswordParams {
  /** 旧密码 */
  oldPassword: string
  /** 新密码（需符合密码强度要求） */
  newPassword: string
  /** 确认新密码（前端校验用） */
  confirmPassword: string
}

/**
 * 重置密码请求参数
 * 忘记密码时通过验证码重置
 */
export interface ResetPasswordParams {
  /** 手机号 */
  phone: string
  /** 验证码 */
  code: string
  /** 新密码 */
  newPassword: string
}

// ==================== 用户信息更新 ====================

/** 更新用户信息参数 */
export interface UpdateUserParams {
  nickname?: string
  avatarUrl?: string
  bio?: string
  gender?: 0 | 1 | 2
  birthday?: string
  region?: string
}

// ==================== 登录状态管理 ====================

/**
 * 用户登录状态
 * 用于Zustand Store管理全局登录状态
 */
export interface AuthState {
  /** 是否已登录 */
  isLoggedIn: boolean
  /** 是否正在加载（登录中、刷新Token中等） */
  isLoading: boolean
  /** 是否已初始化（检查本地存储的登录状态） */
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
 * 用户Store的Actions
 * 定义所有可执行的操作
 */
export interface AuthActions {
  /** 初始化：从本地存储恢复登录状态 */
  initialize: () => Promise<void>
  /** 登录 */
  login: (params: LoginParams) => Promise<LoginResponse>
  /** 登出 */
  logout: () => Promise<void>
  /** 刷新Token */
  refreshToken: () => Promise<void>
  /** 更新用户信息 */
  updateUserInfo: (params: UpdateUserParams) => Promise<void>
  /** 清除错误 */
  clearError: () => void
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void
}

// ==================== API响应格式 ====================

/**
 * API通用响应格式
 * 统一的响应格式便于前端统一处理
 */
export interface ApiResponse<T = any> {
  /** 状态码: 0表示成功，其他为错误码 */
  code: number
  /** 响应消息，成功时为success，失败时为错误描述 */
  message: string
  /** 响应数据 */
  data: T
  /** 服务器时间戳（毫秒） */
  timestamp: number
}

// ==================== 错误码定义 ====================

/**
 * 登录相关错误码
 * 统一的错误码便于前端处理不同错误情况
 */
export enum AuthErrorCode {
  /** 成功 */
  SUCCESS = 0,
  /** 验证码错误 */
  INVALID_CODE = 1001,
  /** 验证码过期 */
  CODE_EXPIRED = 1002,
  /** 密码错误 */
  INVALID_PASSWORD = 1003,
  /** 账号不存在 */
  ACCOUNT_NOT_FOUND = 1004,
  /** 账号已被禁用 */
  ACCOUNT_DISABLED = 1005,
  /** 登录次数过多，账号被锁定 */
  ACCOUNT_LOCKED = 1006,
  /** Token无效 */
  INVALID_TOKEN = 1007,
  /** Token过期 */
  TOKEN_EXPIRED = 1008,
  /** 刷新Token过期，需要重新登录 */
  REFRESH_TOKEN_EXPIRED = 1009,
  /** 手机号格式错误 */
  INVALID_PHONE = 1010,
  /** 发送验证码过于频繁 */
  SEND_CODE_TOO_FREQUENT = 1011,
  /** 微信授权失败 */
  WECHAT_AUTH_FAILED = 1012,
  /** 网络错误 */
  NETWORK_ERROR = 9001,
  /** 服务器错误 */
  SERVER_ERROR = 9999,
}
