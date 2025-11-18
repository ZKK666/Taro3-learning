/**
 * 私信/聊天相关接口服务
 */

import { get, post } from './request'
import type {
  Conversation,
  ChatMessage,
  ConversationListParams,
  ChatHistoryParams,
  SendMessageParams
} from '@/types/chat'
import type { PaginationData } from '@/types/api'

const chatService = {
  /**
   * 获取会话列表
   * GET /chat/conversations
   */
  getConversations(params: ConversationListParams): Promise<PaginationData<Conversation>> {
    return get('/chat/conversations', params)
  },

  /**
   * 获取聊天记录
   * GET /chat/history
   */
  getChatHistory(params: ChatHistoryParams): Promise<{ list: ChatMessage[]; hasMore: boolean }> {
    return get('/chat/history', params)
  },

  /**
   * 发送消息
   * POST /chat/send
   */
  sendMessage(params: SendMessageParams): Promise<ChatMessage> {
    return post('/chat/send', params)
  },

  /**
   * 标记已读
   * POST /chat/read
   */
  markAsRead(conversationId: string): Promise<void> {
    return post('/chat/read', { conversationId })
  },

  /**
   * 删除会话
   * POST /chat/delete
   */
  deleteConversation(conversationId: string): Promise<void> {
    return post('/chat/delete', { conversationId })
  },

  /**
   * 置顶会话
   * POST /chat/pin
   */
  pinConversation(conversationId: string, isPinned: boolean): Promise<void> {
    return post('/chat/pin', { conversationId, isPinned })
  },

  /**
   * 设置免打扰
   * POST /chat/mute
   */
  muteConversation(conversationId: string, isMuted: boolean): Promise<void> {
    return post('/chat/mute', { conversationId, isMuted })
  },

  /**
   * 获取未读消息数
   * GET /chat/unread-count
   */
  getUnreadCount(): Promise<{ total: number }> {
    return get('/chat/unread-count')
  }
}

export default chatService
