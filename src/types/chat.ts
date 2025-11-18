/**
 * 私信/聊天相关类型定义
 */

import type { UserInfo } from './user'

/** 会话信息 */
export interface Conversation {
  id: string
  /** 对方用户信息 */
  user: UserInfo
  /** 最后一条消息 */
  lastMessage: ChatMessage
  /** 未读数量 */
  unreadCount: number
  /** 是否置顶 */
  isPinned: boolean
  /** 是否免打扰 */
  isMuted: boolean
  /** 更新时间 */
  updateTime: string
}

/** 聊天消息 */
export interface ChatMessage {
  id: string
  /** 会话 ID */
  conversationId: string
  /** 发送者 ID */
  senderId: string
  /** 消息类型 */
  type: 'text' | 'image' | 'video' | 'voice' | 'share'
  /** 消息内容 */
  content: string
  /** 媒体 URL（图片/视频/语音） */
  mediaUrl?: string
  /** 分享内容（分享类型时） */
  shareData?: {
    type: 'video' | 'user' | 'live'
    id: string
    title: string
    coverUrl: string
  }
  /** 发送状态 */
  status: 'sending' | 'sent' | 'failed'
  /** 是否已读 */
  isRead: boolean
  /** 发送时间 */
  createTime: string
}

/** 会话列表请求参数 */
export interface ConversationListParams {
  page: number
  pageSize: number
}

/** 聊天记录请求参数 */
export interface ChatHistoryParams {
  conversationId: string
  /** 最后一条消息 ID（用于分页） */
  lastMessageId?: string
  pageSize: number
}

/** 发送消息参数 */
export interface SendMessageParams {
  /** 接收者 ID */
  toUserId: string
  /** 消息类型 */
  type: 'text' | 'image' | 'video' | 'voice' | 'share'
  /** 消息内容 */
  content: string
  /** 媒体文件路径 */
  mediaPath?: string
  /** 分享数据 */
  shareData?: ChatMessage['shareData']
}
