/**
 * 用户相关接口服务
 */

import { get, post } from './request'
import type {
  UserInfo,
  UserDetail,
  FollowItem,
  UserListParams,
  LoginParams,
  LoginResult,
  UpdateUserParams
} from '@/types/user'
import type { PaginationData } from '@/types/api'

const userService = {
  /**
   * 微信登录
   * POST /user/login
   */
  login(params: LoginParams): Promise<LoginResult> {
    return post('/user/login', params)
  },

  /**
   * 获取当前用户信息
   * GET /user/info
   */
  getCurrentUser(): Promise<UserDetail> {
    return get('/user/info')
  },

  /**
   * 获取用户详情
   * GET /user/detail
   */
  getUserDetail(userId: string): Promise<UserDetail> {
    return get('/user/detail', { userId })
  },

  /**
   * 更新用户信息
   * POST /user/update
   */
  updateUserInfo(params: UpdateUserParams): Promise<UserInfo> {
    return post('/user/update', params)
  },

  /**
   * 关注用户
   * POST /user/follow
   */
  followUser(userId: string): Promise<{ isFollowed: boolean }> {
    return post('/user/follow', { userId })
  },

  /**
   * 取消关注
   * POST /user/unfollow
   */
  unfollowUser(userId: string): Promise<{ isFollowed: boolean }> {
    return post('/user/unfollow', { userId })
  },

  /**
   * 获取关注/粉丝列表
   * GET /user/follow-list
   */
  getFollowList(params: UserListParams): Promise<PaginationData<FollowItem>> {
    return get('/user/follow-list', params)
  },

  /**
   * 检查登录状态
   * GET /user/check-login
   */
  checkLogin(): Promise<{ isLogin: boolean }> {
    return get('/user/check-login', {}, { showLoading: false, showError: false })
  },

  /**
   * 退出登录
   * POST /user/logout
   */
  logout(): Promise<void> {
    return post('/user/logout')
  }
}

export default userService
