/**
 * 直播相关接口服务
 */

import { get, post } from './request'
import type { LiveRoom, LiveListParams, GiftInfo } from '@/types/live'
import type { PaginationData } from '@/types/api'

const liveService = {
  /**
   * 获取直播列表
   * GET /live/list
   */
  getLiveList(params: LiveListParams): Promise<PaginationData<LiveRoom>> {
    return get('/live/list', params)
  },

  /**
   * 获取直播间详情
   * GET /live/detail
   */
  getLiveDetail(roomId: string): Promise<LiveRoom> {
    return get('/live/detail', { roomId })
  },

  /**
   * 进入直播间
   * POST /live/enter
   */
  enterLiveRoom(roomId: string): Promise<{ streamUrl: string }> {
    return post('/live/enter', { roomId })
  },

  /**
   * 离开直播间
   * POST /live/leave
   */
  leaveLiveRoom(roomId: string): Promise<void> {
    return post('/live/leave', { roomId })
  },

  /**
   * 获取礼物列表
   * GET /live/gifts
   */
  getGiftList(): Promise<GiftInfo[]> {
    return get('/live/gifts')
  },

  /**
   * 发送礼物
   * POST /live/send-gift
   */
  sendGift(roomId: string, giftId: string, count: number): Promise<void> {
    return post('/live/send-gift', { roomId, giftId, count })
  },

  /**
   * 发送弹幕
   * POST /live/send-message
   */
  sendMessage(roomId: string, content: string): Promise<void> {
    return post('/live/send-message', { roomId, content })
  },

  /**
   * 关注主播
   * POST /live/follow
   */
  followAnchor(roomId: string): Promise<void> {
    return post('/live/follow', { roomId })
  }
}

export default liveService
