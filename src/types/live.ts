/**
 * 直播相关类型定义
 */

import type { UserInfo } from './user'

/** 直播间信息 */
export interface LiveRoom {
  id: string
  /** 直播间标题 */
  title: string
  /** 封面图 */
  coverUrl: string
  /** 主播信息 */
  anchor: UserInfo
  /** 观看人数 */
  watchCount: number
  /** 点赞数 */
  likeCount: number
  /** 直播状态: living-直播中, ended-已结束, preview-预告 */
  status: 'living' | 'ended' | 'preview'
  /** 开始时间 */
  startTime: string
  /** 分类标签 */
  category: string
  /** 直播流地址 */
  streamUrl?: string
}

/** 直播列表请求参数 */
export interface LiveListParams {
  /** 类型: recommend-推荐, following-关注, nearby-附近 */
  type: 'recommend' | 'following' | 'nearby'
  /** 分类 */
  category?: string
  page: number
  pageSize: number
}

/** 礼物信息 */
export interface GiftInfo {
  id: string
  /** 礼物名称 */
  name: string
  /** 礼物图标 */
  iconUrl: string
  /** 价格（抖币） */
  price: number
  /** 特效类型 */
  effectType: 'normal' | 'full_screen' | 'combo'
}

/** 直播间消息 */
export interface LiveMessage {
  id: string
  /** 消息类型 */
  type: 'chat' | 'gift' | 'enter' | 'follow' | 'system'
  /** 发送用户 */
  user: UserInfo
  /** 消息内容 */
  content: string
  /** 礼物信息（礼物消息时） */
  gift?: GiftInfo
  /** 礼物数量 */
  giftCount?: number
  /** 发送时间 */
  createTime: string
}
