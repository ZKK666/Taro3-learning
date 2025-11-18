/**
 * 消息通知相关类型定义
 */

import type { UserInfo } from './user'
import type { VideoInfo } from './video'

/** 消息类型 */
export type MessageType = 'like' | 'comment' | 'follow' | 'at' | 'system'

/** 消息基础信息 */
export interface MessageBase {
  id: string
  /** 消息类型 */
  type: MessageType
  /** 是否已读 */
  isRead: boolean
  /** 创建时间 */
  createTime: string
}

/** 点赞消息 */
export interface LikeMessage extends MessageBase {
  type: 'like'
  /** 点赞用户 */
  user: UserInfo
  /** 被点赞的视频 */
  video: Pick<VideoInfo, 'id' | 'coverUrl' | 'title'>
}

/** 评论消息 */
export interface CommentMessage extends MessageBase {
  type: 'comment'
  /** 评论用户 */
  user: UserInfo
  /** 评论内容 */
  content: string
  /** 被评论的视频 */
  video: Pick<VideoInfo, 'id' | 'coverUrl' | 'title'>
}

/** 关注消息 */
export interface FollowMessage extends MessageBase {
  type: 'follow'
  /** 关注用户 */
  user: UserInfo
}

/** @消息 */
export interface AtMessage extends MessageBase {
  type: 'at'
  /** @的用户 */
  user: UserInfo
  /** @的内容 */
  content: string
  /** 相关视频 */
  video: Pick<VideoInfo, 'id' | 'coverUrl' | 'title'>
}

/** 系统消息 */
export interface SystemMessage extends MessageBase {
  type: 'system'
  /** 消息标题 */
  title: string
  /** 消息内容 */
  content: string
  /** 跳转链接（可选） */
  link?: string
}

/** 消息联合类型 */
export type Message = LikeMessage | CommentMessage | FollowMessage | AtMessage | SystemMessage

/** 消息列表请求参数 */
export interface MessageListParams {
  type: MessageType | 'all'
  page: number
  pageSize: number
}

/** 未读消息数量 */
export interface UnreadCount {
  total: number
  like: number
  comment: number
  follow: number
  at: number
  system: number
}

/** 消息中心聚合数据 */
export interface MessageCenter {
  unreadCount: UnreadCount
  /** 最新的各类消息预览 */
  previews: {
    like?: LikeMessage
    comment?: CommentMessage
    follow?: FollowMessage
    system?: SystemMessage
  }
}
