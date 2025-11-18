/**
 * 消息通知相关接口服务
 */

import { get, post } from './request'
import type {
  Message,
  MessageListParams,
  MessageCenter,
  UnreadCount
} from '@/types/message'
import type { PaginationData } from '@/types/api'

const messageService = {
  /**
   * 获取消息中心数据
   * GET /message/center
   */
  getMessageCenter(): Promise<MessageCenter> {
    return get('/message/center')
  },

  /**
   * 获取未读消息数量
   * GET /message/unread-count
   */
  getUnreadCount(): Promise<UnreadCount> {
    return get('/message/unread-count')
  },

  /**
   * 获取消息列表
   * GET /message/list
   */
  getMessageList(params: MessageListParams): Promise<PaginationData<Message>> {
    return get('/message/list', params)
  },

  /**
   * 标记消息已读
   * POST /message/read
   */
  markAsRead(messageIds: string[]): Promise<void> {
    return post('/message/read', { messageIds })
  },

  /**
   * 标记全部已读
   * POST /message/read-all
   */
  markAllAsRead(type?: string): Promise<void> {
    return post('/message/read-all', { type })
  },

  /**
   * 删除消息
   * POST /message/delete
   */
  deleteMessage(messageIds: string[]): Promise<void> {
    return post('/message/delete', { messageIds })
  }
}

export default messageService
