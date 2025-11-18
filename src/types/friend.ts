/**
 * 朋友/社交相关类型定义
 */

import type { UserInfo } from './user'
import type { VideoInfo } from './video'

/** 朋友动态 */
export interface FriendMoment {
  id: string
  /** 动态类型 */
  type: 'video' | 'daily' | 'repost'
  /** 发布用户 */
  user: UserInfo
  /** 内容（文字描述） */
  content: string
  /** 视频信息（视频动态时） */
  video?: VideoInfo
  /** 图片列表（日常动态时） */
  images?: string[]
  /** 转发的视频（转发时） */
  repostVideo?: VideoInfo
  /** 点赞数 */
  likeCount: number
  /** 评论数 */
  commentCount: number
  /** 是否已点赞 */
  isLiked: boolean
  /** 发布时间 */
  createTime: string
  /** 位置信息 */
  location?: string
}

/** 日常动态（24小时后消失） */
export interface DailyStory {
  id: string
  /** 用户信息 */
  user: UserInfo
  /** 内容列表 */
  items: DailyStoryItem[]
  /** 是否全部已看 */
  isAllViewed: boolean
  /** 更新时间 */
  updateTime: string
}

/** 日常动态项 */
export interface DailyStoryItem {
  id: string
  /** 类型: image-图片, video-视频 */
  type: 'image' | 'video'
  /** 媒体 URL */
  mediaUrl: string
  /** 时长（视频时） */
  duration?: number
  /** 是否已看 */
  isViewed: boolean
  /** 发布时间 */
  createTime: string
}

/** 好友推荐 */
export interface FriendRecommend {
  user: UserInfo
  /** 推荐理由 */
  reason: string
  /** 共同好友数 */
  mutualFriends: number
}

/** 朋友动态请求参数 */
export interface FriendMomentParams {
  page: number
  pageSize: number
}
