/**
 * 评论相关类型定义
 */

import type { UserInfo } from './user'

/** 评论信息 */
export interface CommentInfo {
  id: string
  /** 视频 ID */
  videoId: string
  /** 评论内容 */
  content: string
  /** 点赞数 */
  likeCount: number
  /** 回复数 */
  replyCount: number
  /** 是否已点赞 */
  isLiked: boolean
  /** 评论用户 */
  user: UserInfo
  /** 创建时间 */
  createTime: string
  /** 回复列表（部分） */
  replies: ReplyInfo[]
  /** 是否有更多回复 */
  hasMoreReplies: boolean
}

/** 回复信息 */
export interface ReplyInfo {
  id: string
  /** 评论 ID */
  commentId: string
  /** 回复内容 */
  content: string
  /** 点赞数 */
  likeCount: number
  /** 是否已点赞 */
  isLiked: boolean
  /** 回复用户 */
  user: UserInfo
  /** 被回复用户（可选） */
  replyToUser?: UserInfo
  /** 创建时间 */
  createTime: string
}

/** 评论列表请求参数 */
export interface CommentListParams {
  videoId: string
  /** 排序: hot-热门, time-时间 */
  sortBy: 'hot' | 'time'
  page: number
  pageSize: number
}

/** 回复列表请求参数 */
export interface ReplyListParams {
  commentId: string
  page: number
  pageSize: number
}

/** 发表评论参数 */
export interface PostCommentParams {
  videoId: string
  content: string
  /** @用户 ID 列表 */
  atUserIds?: string[]
}

/** 发表回复参数 */
export interface PostReplyParams {
  commentId: string
  content: string
  /** 被回复用户 ID */
  replyToUserId?: string
  /** @用户 ID 列表 */
  atUserIds?: string[]
}

/** 评论/回复响应 */
export interface PostCommentResult {
  id: string
  createTime: string
}
