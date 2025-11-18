/**
 * 视频相关类型定义
 */

import type { UserInfo } from './user'

/** 视频信息 */
export interface VideoInfo {
  id: string
  /** 视频标题 */
  title: string
  /** 视频描述 */
  description: string
  /** 视频封面 URL */
  coverUrl: string
  /** 视频播放 URL */
  videoUrl: string
  /** 视频时长（秒） */
  duration: number
  /** 视频宽度 */
  width: number
  /** 视频高度 */
  height: number
  /** 播放次数 */
  playCount: number
  /** 点赞数 */
  likeCount: number
  /** 评论数 */
  commentCount: number
  /** 分享数 */
  shareCount: number
  /** 收藏数 */
  collectCount: number
  /** 是否已点赞 */
  isLiked: boolean
  /** 是否已收藏 */
  isCollected: boolean
  /** 作者信息 */
  author: UserInfo
  /** 话题标签 */
  topics: TopicInfo[]
  /** 创建时间 */
  createTime: string
  /** 可见范围: public-公开, friends-朋友可见, private-私密 */
  visibility: 'public' | 'friends' | 'private'
}

/** 话题信息 */
export interface TopicInfo {
  id: string
  /** 话题名称 */
  name: string
  /** 话题描述 */
  description: string
  /** 话题封面 */
  coverUrl: string
  /** 参与视频数 */
  videoCount: number
  /** 参与人数 */
  participantCount: number
  /** 浏览次数 */
  viewCount: number
}

/** 视频列表请求参数 */
export interface VideoListParams {
  /** 列表类型: recommend-推荐, following-关注, nearby-附近 */
  type: 'recommend' | 'following' | 'nearby'
  page: number
  pageSize: number
}

/** 用户作品列表请求参数 */
export interface UserVideoParams {
  userId: string
  /** 类型: works-作品, likes-喜欢 */
  type: 'works' | 'likes'
  page: number
  pageSize: number
}

/** 发布视频参数 */
export interface PublishVideoParams {
  /** 视频本地路径 */
  videoPath: string
  /** 封面本地路径 */
  coverPath: string
  /** 标题 */
  title: string
  /** 描述 */
  description: string
  /** 话题 ID 列表 */
  topicIds: string[]
  /** 可见范围 */
  visibility: 'public' | 'friends' | 'private'
  /** @用户 ID 列表 */
  atUserIds?: string[]
  /** 位置信息 */
  location?: {
    name: string
    latitude: number
    longitude: number
  }
}

/** 发布视频响应 */
export interface PublishVideoResult {
  videoId: string
  status: 'processing' | 'success' | 'failed'
  message: string
}
