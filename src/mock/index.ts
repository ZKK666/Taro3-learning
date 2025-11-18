/**
 * Mock 数据调度器
 * 根据请求路径和方法分发到对应的 Mock 处理器
 */

import type { ApiResponse } from '@/types/api'
import { videoMock } from './video'
import { userMock } from './user'
import { commentMock } from './comment'
import { searchMock } from './search'
import { messageMock } from './message'

interface MockRequest {
  url: string
  method: string
  data?: Record<string, any>
}

type MockHandler = (data?: Record<string, any>) => any

interface MockRoute {
  path: string
  method: string
  handler: MockHandler
}

// 注册所有 Mock 路由
const mockRoutes: MockRoute[] = [
  // 视频相关
  { path: '/video/list', method: 'GET', handler: videoMock.getVideoList },
  { path: '/video/detail', method: 'GET', handler: videoMock.getVideoDetail },
  { path: '/video/user', method: 'GET', handler: videoMock.getUserVideos },
  { path: '/video/like', method: 'POST', handler: videoMock.likeVideo },
  { path: '/video/unlike', method: 'POST', handler: videoMock.unlikeVideo },
  { path: '/video/collect', method: 'POST', handler: videoMock.collectVideo },
  { path: '/video/uncollect', method: 'POST', handler: videoMock.uncollectVideo },
  { path: '/video/publish', method: 'POST', handler: videoMock.publishVideo },
  { path: '/video/delete', method: 'POST', handler: videoMock.deleteVideo },

  // 用户相关
  { path: '/user/login', method: 'POST', handler: userMock.login },
  { path: '/user/info', method: 'GET', handler: userMock.getCurrentUser },
  { path: '/user/detail', method: 'GET', handler: userMock.getUserDetail },
  { path: '/user/update', method: 'POST', handler: userMock.updateUserInfo },
  { path: '/user/follow', method: 'POST', handler: userMock.followUser },
  { path: '/user/unfollow', method: 'POST', handler: userMock.unfollowUser },
  { path: '/user/follow-list', method: 'GET', handler: userMock.getFollowList },
  { path: '/user/check-login', method: 'GET', handler: userMock.checkLogin },
  { path: '/user/logout', method: 'POST', handler: userMock.logout },

  // 评论相关
  { path: '/comment/list', method: 'GET', handler: commentMock.getCommentList },
  { path: '/comment/reply-list', method: 'GET', handler: commentMock.getReplyList },
  { path: '/comment/post', method: 'POST', handler: commentMock.postComment },
  { path: '/comment/reply', method: 'POST', handler: commentMock.postReply },
  { path: '/comment/like', method: 'POST', handler: commentMock.likeComment },
  { path: '/comment/unlike', method: 'POST', handler: commentMock.unlikeComment },
  { path: '/comment/delete', method: 'POST', handler: commentMock.deleteComment },

  // 搜索相关
  { path: '/search/query', method: 'GET', handler: searchMock.search },
  { path: '/search/suggest', method: 'GET', handler: searchMock.getSuggestions },
  { path: '/search/hot', method: 'GET', handler: searchMock.getHotSearch },
  { path: '/search/history', method: 'GET', handler: searchMock.getSearchHistory },
  { path: '/search/clear-history', method: 'POST', handler: searchMock.clearSearchHistory },

  // 消息相关
  { path: '/message/center', method: 'GET', handler: messageMock.getMessageCenter },
  { path: '/message/unread-count', method: 'GET', handler: messageMock.getUnreadCount },
  { path: '/message/list', method: 'GET', handler: messageMock.getMessageList },
  { path: '/message/read', method: 'POST', handler: messageMock.markAsRead },
  { path: '/message/read-all', method: 'POST', handler: messageMock.markAllAsRead }
]

/**
 * Mock 请求调度器
 */
export async function mockDispatcher<T>(request: MockRequest): Promise<ApiResponse<T>> {
  // 模拟网络延迟
  await delay(200 + Math.random() * 300)

  const { url, method, data } = request

  // 查找匹配的路由
  const route = mockRoutes.find(r => r.path === url && r.method === method)

  if (!route) {
    return {
      code: 404,
      message: `Mock route not found: ${method} ${url}`,
      data: null as any,
      timestamp: Date.now()
    }
  }

  try {
    const result = route.handler(data)
    return {
      code: 0,
      message: 'success',
      data: result as T,
      timestamp: Date.now()
    }
  } catch (error: any) {
    return {
      code: error.code || 500,
      message: error.message || 'Mock handler error',
      data: null as any,
      timestamp: Date.now()
    }
  }
}

/** 延迟函数 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export { videoMock } from './video'
export { userMock } from './user'
export { commentMock } from './comment'
export { searchMock } from './search'
export { messageMock } from './message'
