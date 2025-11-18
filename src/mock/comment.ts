/**
 * 评论相关 Mock 数据
 */

import type { CommentInfo, ReplyInfo, PostCommentResult } from '@/types/comment'
import type { PaginationData } from '@/types/api'
import { mockUsers } from './user'

// 生成 Mock 评论数据
function generateComments(videoId: string): CommentInfo[] {
  return Array.from({ length: 30 }, (_, i) => {
    const user = mockUsers[i % mockUsers.length]
    const replies = generateReplies(`comment_${videoId}_${i}`, 3)

    return {
      id: `comment_${videoId}_${i}`,
      videoId,
      content: getRandomCommentContent(i),
      likeCount: Math.floor(Math.random() * 1000),
      replyCount: replies.length + Math.floor(Math.random() * 10),
      isLiked: Math.random() > 0.8,
      user,
      createTime: new Date(Date.now() - i * 3600000).toISOString(),
      replies,
      hasMoreReplies: Math.random() > 0.5
    }
  })
}

// 生成回复数据
function generateReplies(commentId: string, count: number): ReplyInfo[] {
  return Array.from({ length: count }, (_, i) => {
    const user = mockUsers[(i + 3) % mockUsers.length]
    const replyToUser = i > 0 ? mockUsers[(i + 2) % mockUsers.length] : undefined

    return {
      id: `reply_${commentId}_${i}`,
      commentId,
      content: getRandomReplyContent(i),
      likeCount: Math.floor(Math.random() * 100),
      isLiked: Math.random() > 0.9,
      user,
      replyToUser,
      createTime: new Date(Date.now() - i * 1800000).toISOString()
    }
  })
}

function getRandomCommentContent(index: number): string {
  const contents = [
    '太棒了，支持！',
    '这个真的很有用，收藏了',
    '哈哈哈笑死我了',
    '学到了学到了',
    '终于找到这个视频了',
    '博主太厉害了',
    '已关注，期待更多作品',
    '这也太好看了吧',
    '请问这个在哪里买的？',
    '我也想试试',
    '好治愈啊',
    '太可爱了！',
    '这波操作666',
    '建议出个教程',
    '已经转发给朋友了'
  ]
  return contents[index % contents.length]
}

function getRandomReplyContent(index: number): string {
  const contents = [
    '对对对，我也觉得',
    '确实是这样',
    '谢谢分享',
    '我也想知道',
    '哈哈同感'
  ]
  return contents[index % contents.length]
}

// 缓存评论数据
const commentsCache: Record<string, CommentInfo[]> = {}

// Mock 处理器
export const commentMock = {
  getCommentList(params?: Record<string, any>): PaginationData<CommentInfo> {
    const { videoId, sortBy = 'hot', page = 1, pageSize = 20 } = params || {}

    if (!commentsCache[videoId]) {
      commentsCache[videoId] = generateComments(videoId)
    }

    let comments = [...commentsCache[videoId]]

    if (sortBy === 'hot') {
      comments.sort((a, b) => b.likeCount - a.likeCount)
    } else {
      comments.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
    }

    const start = (page - 1) * pageSize
    const end = start + pageSize
    const list = comments.slice(start, end)

    return {
      list,
      total: comments.length,
      page,
      pageSize,
      hasMore: end < comments.length
    }
  },

  getReplyList(params?: Record<string, any>): PaginationData<ReplyInfo> {
    const { commentId, page = 1, pageSize = 20 } = params || {}

    const replies = generateReplies(commentId, 20)
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const list = replies.slice(start, end)

    return {
      list,
      total: replies.length,
      page,
      pageSize,
      hasMore: end < replies.length
    }
  },

  postComment(params?: Record<string, any>): PostCommentResult {
    const { videoId } = params || {}
    const commentId = `comment_${videoId}_new_${Date.now()}`

    return {
      id: commentId,
      createTime: new Date().toISOString()
    }
  },

  postReply(params?: Record<string, any>): PostCommentResult {
    const { commentId } = params || {}
    const replyId = `reply_${commentId}_new_${Date.now()}`

    return {
      id: replyId,
      createTime: new Date().toISOString()
    }
  },

  likeComment(params?: Record<string, any>): { likeCount: number } {
    return { likeCount: Math.floor(Math.random() * 1000) + 1 }
  },

  unlikeComment(params?: Record<string, any>): { likeCount: number } {
    return { likeCount: Math.floor(Math.random() * 1000) }
  },

  deleteComment(_params?: Record<string, any>): void {
    // Mock 删除操作
  }
}
