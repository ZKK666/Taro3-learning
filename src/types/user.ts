/**
 * 用户相关类型定义
 */

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
  /** 是否已关注 */
  isFollowed: boolean
  /** 是否是好友（互相关注） */
  isFriend: boolean
  /** 是否是官方认证 */
  isVerified: boolean
  /** 认证信息 */
  verifyInfo: string
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

/** 登录请求参数 */
export interface LoginParams {
  /** 微信 code */
  code: string
  /** 用户信息（可选，首次登录需要） */
  userInfo?: {
    nickName: string
    avatarUrl: string
    gender: number
  }
}

/** 登录响应 */
export interface LoginResult {
  token: string
  userInfo: UserInfo
  isNewUser: boolean
}

/** 更新用户信息参数 */
export interface UpdateUserParams {
  nickname?: string
  avatarUrl?: string
  bio?: string
  gender?: 0 | 1 | 2
  birthday?: string
  region?: string
}
