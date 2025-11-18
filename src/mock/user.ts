/**
 * 用户相关 Mock 数据
 */

import type { UserInfo, UserDetail, FollowItem, LoginResult } from '@/types/user'
import type { PaginationData } from '@/types/api'

// Mock 用户数据
export const mockUsers: UserInfo[] = [
  {
    id: 'user_001',
    nickname: '小红薯创作者',
    avatarUrl: 'https://picsum.photos/200/200?random=u1',
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
    avatarUrl: 'https://picsum.photos/200/200?random=u2',
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
    avatarUrl: 'https://picsum.photos/200/200?random=u3',
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
    avatarUrl: 'https://picsum.photos/200/200?random=u4',
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
    avatarUrl: 'https://picsum.photos/200/200?random=u5',
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
    avatarUrl: 'https://picsum.photos/200/200?random=u6',
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
    avatarUrl: 'https://picsum.photos/200/200?random=u7',
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
    avatarUrl: 'https://picsum.photos/200/200?random=u8',
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
  }
}
