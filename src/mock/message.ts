/**
 * 消息通知相关 Mock 数据
 */

import type {
  Message,
  LikeMessage,
  CommentMessage,
  FollowMessage,
  SystemMessage,
  MessageCenter,
  UnreadCount
} from '@/types/message'
import type { PaginationData } from '@/types/api'
import { mockUsers } from './user'
import { mockVideos } from './video'

// 生成点赞消息
function generateLikeMessages(count: number): LikeMessage[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `like_msg_${i}`,
    type: 'like' as const,
    isRead: i > 3,
    createTime: new Date(Date.now() - i * 3600000).toISOString(),
    user: mockUsers[i % mockUsers.length],
    video: {
      id: mockVideos[i % mockVideos.length].id,
      coverUrl: mockVideos[i % mockVideos.length].coverUrl,
      title: mockVideos[i % mockVideos.length].title
    }
  }))
}

// 生成评论消息
function generateCommentMessages(count: number): CommentMessage[] {
  const commentContents = [
    '这个视频太棒了！',
    '学到了很多',
    '请问是在哪里拍的？',
    '期待更多作品',
    '已关注，加油！'
  ]

  return Array.from({ length: count }, (_, i) => ({
    id: `comment_msg_${i}`,
    type: 'comment' as const,
    isRead: i > 2,
    createTime: new Date(Date.now() - i * 7200000).toISOString(),
    user: mockUsers[i % mockUsers.length],
    content: commentContents[i % commentContents.length],
    video: {
      id: mockVideos[i % mockVideos.length].id,
      coverUrl: mockVideos[i % mockVideos.length].coverUrl,
      title: mockVideos[i % mockVideos.length].title
    }
  }))
}

// 生成关注消息
function generateFollowMessages(count: number): FollowMessage[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `follow_msg_${i}`,
    type: 'follow' as const,
    isRead: i > 1,
    createTime: new Date(Date.now() - i * 10800000).toISOString(),
    user: mockUsers[i % mockUsers.length]
  }))
}

// 生成系统消息
function generateSystemMessages(count: number): SystemMessage[] {
  const systemMessages = [
    { title: '账号安全提醒', content: '您的账号在新设备上登录，如非本人操作请及时修改密码' },
    { title: '活动通知', content: '春节活动已开启，参与即有机会获得红包奖励' },
    { title: '功能更新', content: '新版本已发布，快来体验全新的视频编辑功能' },
    { title: '创作者激励', content: '恭喜您获得本月优质创作者奖励，奖金已发放至账户' },
    { title: '社区规范', content: '请遵守社区规范，共同维护良好的创作环境' }
  ]

  return Array.from({ length: count }, (_, i) => ({
    id: `system_msg_${i}`,
    type: 'system' as const,
    isRead: i > 0,
    createTime: new Date(Date.now() - i * 86400000).toISOString(),
    title: systemMessages[i % systemMessages.length].title,
    content: systemMessages[i % systemMessages.length].content,
    link: i === 1 ? '/pages/activity/index' : undefined
  }))
}

// 缓存消息数据
const likeMessages = generateLikeMessages(20)
const commentMessages = generateCommentMessages(15)
const followMessages = generateFollowMessages(10)
const systemMessages = generateSystemMessages(5)

// Mock 处理器
export const messageMock = {
  getMessageCenter(): MessageCenter {
    const unreadCount = {
      total: 4 + 3 + 2 + 1,
      like: 4,
      comment: 3,
      follow: 2,
      at: 0,
      system: 1
    }

    return {
      unreadCount,
      previews: {
        like: likeMessages[0],
        comment: commentMessages[0],
        follow: followMessages[0],
        system: systemMessages[0]
      }
    }
  },

  getUnreadCount(): UnreadCount {
    return {
      total: 10,
      like: 4,
      comment: 3,
      follow: 2,
      at: 0,
      system: 1
    }
  },

  getMessageList(params?: Record<string, any>): PaginationData<Message> {
    const { type = 'all', page = 1, pageSize = 20 } = params || {}

    let messages: Message[] = []

    switch (type) {
      case 'like':
        messages = likeMessages
        break
      case 'comment':
        messages = commentMessages
        break
      case 'follow':
        messages = followMessages
        break
      case 'system':
        messages = systemMessages
        break
      default:
        // 合并所有消息并按时间排序
        messages = [
          ...likeMessages,
          ...commentMessages,
          ...followMessages,
          ...systemMessages
        ].sort((a, b) =>
          new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
        )
    }

    const start = (page - 1) * pageSize
    const end = start + pageSize
    const list = messages.slice(start, end)

    return {
      list,
      total: messages.length,
      page,
      pageSize,
      hasMore: end < messages.length
    }
  },

  markAsRead(params?: Record<string, any>): void {
    const { messageIds } = params || {}
    // Mock 标记已读
    console.log('Mark as read:', messageIds)
  },

  markAllAsRead(params?: Record<string, any>): void {
    const { type } = params || {}
    // Mock 全部已读
    console.log('Mark all as read:', type)
  }
}
