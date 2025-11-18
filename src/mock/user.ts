/**
 * 用户相关 Mock 数据
 *
 * 模拟后端接口返回，用于开发和测试
 * 包含登录、用户信息、验证码等Mock数据
 *
 * 【企业级Mock设计要点】
 * 1. 模拟真实的数据结构和业务逻辑
 * 2. 包含各种边界情况（新用户、认证用户等）
 * 3. 模拟网络延迟和错误情况
 * 4. 提供测试账号便于调试
 */

import type {
  UserInfo,
  UserDetail,
  FollowItem,
  LoginResult,
  UserStats,
  TokenInfo,
  LoginResponse,
  SendCodeResponse,
  LoginParams,
} from '@/types/user'
import type { PaginationData } from '@/types/api'

// ==================== Mock 用户数据 ====================

// Mock 用户数据（原有数据）
export const mockUsers: UserInfo[] = [
  {
    id: 'user_001',
    nickname: '小红薯创作者',
    avatarUrl: 'https://placehold.co/200x200/333/fff?random=u1',
    bio: '分享生活中的美好瞬间',
    gender: 2,
    birthday: '1995-06-15',
    region: '北京',
    uniqueId: 'creator001',
    isFollowed: false,
    isFriend: false,
    isVerified: true,
    verifyInfo: '优质内容创作者'
  },
  {
    id: 'user_002',
    nickname: '美食达人阿强',
    avatarUrl: 'https://placehold.co/200x200/333/fff?random=u2',
    bio: '专注美食制作10年',
    gender: 1,
    birthday: '1988-03-22',
    region: '上海',
    uniqueId: 'foodie_aqiang',
    isFollowed: true,
    isFriend: false,
    isVerified: true,
    verifyInfo: '美食领域优质创作者'
  },
  {
    id: 'user_003',
    nickname: '舞蹈小王子',
    avatarUrl: 'https://placehold.co/200x200/333/fff?random=u3',
    bio: '跳舞使我快乐',
    gender: 1,
    birthday: '1998-09-10',
    region: '广州',
    uniqueId: 'dance_prince',
    isFollowed: false,
    isFriend: false,
    isVerified: false,
    verifyInfo: ''
  },
  {
    id: 'user_004',
    nickname: '旅行家小美',
    avatarUrl: 'https://placehold.co/200x200/333/fff?random=u4',
    bio: '世界那么大，我想去看看',
    gender: 2,
    birthday: '1992-12-05',
    region: '深圳',
    uniqueId: 'travel_mei',
    isFollowed: true,
    isFriend: true,
    isVerified: true,
    verifyInfo: '旅行博主'
  },
  {
    id: 'user_005',
    nickname: '知识分享官',
    avatarUrl: 'https://placehold.co/200x200/333/fff?random=u5',
    bio: '每天学习一点新知识',
    gender: 1,
    birthday: '1990-07-18',
    region: '杭州',
    uniqueId: 'knowledge_share',
    isFollowed: false,
    isFriend: false,
    isVerified: true,
    verifyInfo: '知识领域创作者'
  },
  {
    id: 'user_006',
    nickname: '萌宠控',
    avatarUrl: 'https://placehold.co/200x200/333/fff?random=u6',
    bio: '家有萌宠，欢乐多多',
    gender: 2,
    birthday: '1996-04-28',
    region: '成都',
    uniqueId: 'pet_lover',
    isFollowed: true,
    isFriend: false,
    isVerified: false,
    verifyInfo: ''
  },
  {
    id: 'user_007',
    nickname: '健身教练Leo',
    avatarUrl: 'https://placehold.co/200x200/333/fff?random=u7',
    bio: '专业健身指导，帮你塑造完美身材',
    gender: 1,
    birthday: '1991-11-30',
    region: '南京',
    uniqueId: 'fitness_leo',
    isFollowed: false,
    isFriend: false,
    isVerified: true,
    verifyInfo: '健身领域专家'
  },
  {
    id: 'user_008',
    nickname: '手工艺人小艾',
    avatarUrl: 'https://placehold.co/200x200/333/fff?random=u8',
    bio: '用双手创造美好',
    gender: 2,
    birthday: '1994-08-08',
    region: '苏州',
    uniqueId: 'handcraft_ai',
    isFollowed: false,
    isFriend: false,
    isVerified: false,
    verifyInfo: ''
  }
]

// ==================== 登录相关Mock数据 ====================

/**
 * Mock 登录用户数据（带密码）
 * 模拟已注册用户的数据
 */
export const mockLoginUsers: Record<string, UserInfo & { password: string }> = {
  // 测试账号1：普通用户
  '13800138000': {
    id: 'user_test_001',
    nickname: '抖音小达人',
    avatarUrl: 'https://placehold.co/200x200/333/fff?random=login1',
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
    createdAt: '2023-01-15T08:00:00Z',
    lastLoginAt: '2024-01-10T10:30:00Z',
    password: '123456', // Mock 密码
  },
  // 测试账号2：认证用户
  '13900139000': {
    id: 'user_test_002',
    nickname: '官方小助手',
    avatarUrl: 'https://placehold.co/200x200/333/fff?random=login2',
    bio: '官方认证账号，为您提供最新资讯',
    gender: 2,
    birthday: '1990-03-20',
    region: '上海市',
    uniqueId: 'official_helper',
    phone: '139****9000',
    isFollowed: false,
    isFriend: false,
    isVerified: true,
    verifyInfo: '抖音官方认证',
    createdAt: '2022-06-01T00:00:00Z',
    lastLoginAt: '2024-01-11T09:00:00Z',
    password: '123456',
  },
  // 测试账号3：新用户
  '13700137000': {
    id: 'user_test_003',
    nickname: '新用户_137',
    avatarUrl: 'https://placehold.co/200x200/333/fff?random=login3',
    bio: '',
    gender: 0,
    birthday: '',
    region: '',
    uniqueId: 'new_user_137',
    phone: '137****7000',
    isFollowed: false,
    isFriend: false,
    isVerified: false,
    verifyInfo: '',
    createdAt: '2024-01-10T12:00:00Z',
    lastLoginAt: '2024-01-10T12:00:00Z',
    password: '123456',
  },
}

/**
 * Mock 用户统计数据
 */
export const mockLoginUserStats: Record<string, UserStats> = {
  user_test_001: {
    followingCount: 128,
    followerCount: 5680,
    likeCount: 23500,
    worksCount: 42,
    likesCount: 156,
  },
  user_test_002: {
    followingCount: 50,
    followerCount: 128000,
    likeCount: 560000,
    worksCount: 320,
    likesCount: 89,
  },
  user_test_003: {
    followingCount: 5,
    followerCount: 0,
    likeCount: 0,
    worksCount: 0,
    likesCount: 3,
  },
}

// ==================== Mock 验证码存储 ====================

/**
 * Mock 验证码存储
 * 实际项目中验证码应该存储在服务端（Redis等）
 */
const mockCodeStorage: Map<string, { code: string; expireAt: number; type: string }> = new Map()

/**
 * 生成随机验证码
 */
function generateCode(length: number = 6): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('')
}

// ==================== 当前登录用户 ====================

// 当前登录用户
let currentUser: UserDetail = {
  ...mockUsers[0],
  id: 'current_user',
  nickname: '我的账号',
  stats: {
    followingCount: 128,
    followerCount: 1024,
    likeCount: 8888,
    worksCount: 36,
    likesCount: 256
  }
}

// ==================== Mock API 函数 ====================

/**
 * Mock 发送验证码
 *
 * @param phone - 手机号
 * @param type - 验证码类型
 * @returns 发送结果
 */
export function mockSendCode(
  phone: string,
  type: 'login' | 'register' | 'reset' | 'bindPhone'
): Promise<SendCodeResponse> {
  return new Promise((resolve, reject) => {
    // 模拟网络延迟
    setTimeout(() => {
      // 验证手机号格式
      if (!/^1[3-9]\d{9}$/.test(phone)) {
        reject(new Error('手机号格式不正确'))
        return
      }

      // 检查是否频繁发送（60秒内只能发送一次）
      const existing = mockCodeStorage.get(phone)
      if (existing && Date.now() < existing.expireAt - 4 * 60 * 1000) {
        reject(new Error('验证码发送过于频繁，请稍后再试'))
        return
      }

      // 生成验证码
      const code = generateCode()
      const expireAt = Date.now() + 5 * 60 * 1000 // 5分钟有效

      // 存储验证码
      mockCodeStorage.set(phone, { code, expireAt, type })

      // 打印验证码（实际项目中会发送短信）
      console.log(`【Mock】验证码已发送到 ${phone}: ${code}`)

      resolve({
        success: true,
        expireSeconds: 300,
        retryAfter: 60,
        message: '验证码已发送',
      })
    }, 500)
  })
}

/**
 * Mock 验证验证码
 *
 * @param phone - 手机号
 * @param code - 验证码
 * @param type - 验证码类型
 * @returns 是否验证通过
 */
export function mockVerifyCode(
  phone: string,
  code: string,
  type: string
): boolean {
  const stored = mockCodeStorage.get(phone)

  // Mock模式下，使用 '123456' 作为万能验证码，方便测试
  if (code === '123456') {
    return true
  }

  if (!stored) {
    return false
  }

  // 检查是否过期
  if (Date.now() > stored.expireAt) {
    mockCodeStorage.delete(phone)
    return false
  }

  // 检查类型是否匹配
  if (stored.type !== type) {
    return false
  }

  // 验证码匹配检查
  const isValid = stored.code === code

  if (isValid) {
    // 验证成功后删除验证码（一次性使用）
    mockCodeStorage.delete(phone)
  }

  return isValid
}

/**
 * Mock 生成 Token
 *
 * @param userId - 用户ID
 * @returns Token信息
 */
export function mockGenerateToken(userId: string): TokenInfo {
  const now = Date.now()

  return {
    // 模拟JWT格式的Token
    accessToken: `mock_access_${userId}_${now}_${Math.random().toString(36).substring(2)}`,
    refreshToken: `mock_refresh_${userId}_${now}_${Math.random().toString(36).substring(2)}`,
    // AccessToken 2小时有效
    expiresAt: now + 2 * 60 * 60 * 1000,
    // RefreshToken 7天有效
    refreshExpiresAt: now + 7 * 24 * 60 * 60 * 1000,
  }
}

/**
 * Mock 登录接口（新版，支持多种登录方式）
 *
 * @param params - 登录参数
 * @returns 登录响应
 */
export function mockLoginWithParams(params: LoginParams): Promise<LoginResponse> {
  return new Promise((resolve, reject) => {
    // 模拟网络延迟
    setTimeout(() => {
      try {
        let userInfo: UserInfo | undefined
        let isNewUser = false

        switch (params.type) {
          case 'phone_code': {
            // 验证码登录
            const { phone, code } = params

            // 验证验证码
            if (!mockVerifyCode(phone, code, 'login')) {
              reject(new Error('验证码错误或已过期'))
              return
            }

            // 查找用户
            const userData = mockLoginUsers[phone]
            if (userData) {
              // 已注册用户
              const { password: _, ...info } = userData
              userInfo = info
            } else {
              // 新用户，自动注册
              isNewUser = true
              userInfo = {
                id: `user_${Date.now()}`,
                nickname: `用户_${phone.substring(7)}`,
                avatarUrl: `https://placehold.co/200x200/333/fff?random=${Date.now()}`,
                bio: '',
                gender: 0,
                birthday: '',
                region: '',
                uniqueId: `user_${phone.substring(7)}`,
                phone: `${phone.substring(0, 3)}****${phone.substring(7)}`,
                isFollowed: false,
                isFriend: false,
                isVerified: false,
                verifyInfo: '',
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
              }
            }
            break
          }

          case 'phone_password': {
            // 密码登录
            const { phone, password } = params

            const userData = mockLoginUsers[phone]
            if (!userData) {
              reject(new Error('账号不存在'))
              return
            }

            if (userData.password !== password) {
              reject(new Error('密码错误'))
              return
            }

            const { password: _, ...info } = userData
            userInfo = info
            break
          }

          case 'wechat': {
            // 微信登录
            const { code, userInfo: wxUserInfo } = params

            // 验证code（Mock模式直接通过）
            if (!code) {
              reject(new Error('微信授权失败'))
              return
            }

            // 模拟根据微信openid查找或创建用户
            isNewUser = true
            userInfo = {
              id: `wx_user_${Date.now()}`,
              nickname: wxUserInfo?.nickName || '微信用户',
              avatarUrl: wxUserInfo?.avatarUrl || `https://placehold.co/200x200/333/fff?random=${Date.now()}`,
              bio: '',
              gender: (wxUserInfo?.gender as 0 | 1 | 2) || 0,
              birthday: '',
              region: '',
              uniqueId: `wx_${Date.now()}`,
              phone: '',
              isFollowed: false,
              isFriend: false,
              isVerified: false,
              verifyInfo: '',
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
            }
            break
          }

          default:
            reject(new Error('不支持的登录方式'))
            return
        }

        if (!userInfo) {
          reject(new Error('登录失败'))
          return
        }

        // 生成Token
        const tokenInfo = mockGenerateToken(userInfo.id)

        // 更新当前用户
        currentUser = {
          ...userInfo,
          stats: mockLoginUserStats[userInfo.id] || {
            followingCount: 0,
            followerCount: 0,
            likeCount: 0,
            worksCount: 0,
            likesCount: 0,
          }
        }

        // 返回登录响应
        resolve({
          userInfo,
          tokenInfo,
          isNewUser,
        })

        console.log(`【Mock】用户登录成功: ${userInfo.nickname}`)
      } catch (error) {
        reject(error)
      }
    }, 800)
  })
}

/**
 * Mock 刷新Token
 *
 * @param refreshToken - 刷新Token
 * @returns 新的Token信息
 */
export function mockRefreshToken(refreshToken: string): Promise<TokenInfo> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 验证refreshToken格式
      if (!refreshToken || !refreshToken.startsWith('mock_refresh_')) {
        reject(new Error('无效的刷新Token'))
        return
      }

      // 提取用户ID
      const parts = refreshToken.split('_')
      const userId = parts[2] || 'unknown'

      // 生成新Token
      const newTokenInfo = mockGenerateToken(userId)

      console.log('【Mock】Token刷新成功')
      resolve(newTokenInfo)
    }, 300)
  })
}

// ==================== 测试辅助 ====================

/**
 * 获取测试账号信息
 * 方便在登录页面提示用户
 */
export const testAccounts = [
  {
    phone: '13800138000',
    password: '123456',
    code: '123456', // 万能验证码
    description: '普通用户',
  },
  {
    phone: '13900139000',
    password: '123456',
    code: '123456',
    description: '认证用户',
  },
  {
    phone: '13700137000',
    password: '123456',
    code: '123456',
    description: '新用户',
  },
]

// ==================== 原有 Mock 处理器 ====================

// Mock 处理器
export const userMock = {
  login(_params?: Record<string, any>): LoginResult {
    return {
      token: 'mock_token_' + Date.now(),
      userInfo: currentUser,
      isNewUser: false
    }
  },

  getCurrentUser(): UserDetail {
    return currentUser
  },

  getUserDetail(params?: Record<string, any>): UserDetail | null {
    const { userId } = params || {}

    if (userId === currentUser.id) {
      return currentUser
    }

    const user = mockUsers.find(u => u.id === userId)
    if (user) {
      return {
        ...user,
        stats: {
          followingCount: Math.floor(50 + Math.random() * 450),
          followerCount: Math.floor(1000 + Math.random() * 99000),
          likeCount: Math.floor(5000 + Math.random() * 95000),
          worksCount: Math.floor(10 + Math.random() * 90),
          likesCount: Math.floor(50 + Math.random() * 450)
        }
      }
    }
    return null
  },

  updateUserInfo(params?: Record<string, any>): UserInfo {
    if (params) {
      currentUser = {
        ...currentUser,
        ...params
      }
    }
    return currentUser
  },

  followUser(params?: Record<string, any>): { isFollowed: boolean } {
    const { userId } = params || {}
    const user = mockUsers.find(u => u.id === userId)
    if (user) {
      user.isFollowed = true
      currentUser.stats.followingCount += 1
    }
    return { isFollowed: true }
  },

  unfollowUser(params?: Record<string, any>): { isFollowed: boolean } {
    const { userId } = params || {}
    const user = mockUsers.find(u => u.id === userId)
    if (user) {
      user.isFollowed = false
      currentUser.stats.followingCount = Math.max(0, currentUser.stats.followingCount - 1)
    }
    return { isFollowed: false }
  },

  getFollowList(params?: Record<string, any>): PaginationData<FollowItem> {
    const { type = 'following', page = 1, pageSize = 20 } = params || {}

    let users = type === 'following'
      ? mockUsers.filter(u => u.isFollowed)
      : mockUsers

    const start = (page - 1) * pageSize
    const end = start + pageSize

    const list: FollowItem[] = users.slice(start, end).map(user => ({
      user,
      followTime: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
      isMutual: user.isFriend
    }))

    return {
      list,
      total: users.length,
      page,
      pageSize,
      hasMore: end < users.length
    }
  },

  checkLogin(): { isLogin: boolean } {
    return { isLogin: true }
  },

  logout(): void {
    // Mock 退出登录
    console.log('【Mock】用户已登出')
  }
}
