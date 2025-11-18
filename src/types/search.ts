/**
 * 搜索相关类型定义
 */

import type { VideoInfo, TopicInfo } from './video'
import type { UserInfo } from './user'

/** 搜索类型 */
export type SearchType = 'video' | 'user' | 'topic'

/** 搜索请求参数 */
export interface SearchParams {
  keyword: string
  type: SearchType
  page: number
  pageSize: number
}

/** 热搜项 */
export interface HotSearchItem {
  id: string
  /** 排名 */
  rank: number
  /** 关键词 */
  keyword: string
  /** 热度值 */
  hotValue: number
  /** 标签: hot-热, new-新, recommend-推荐 */
  tag?: 'hot' | 'new' | 'recommend'
}

/** 搜索建议 */
export interface SearchSuggestion {
  keyword: string
  /** 匹配类型 */
  type: SearchType
  /** 高亮文本 */
  highlight: string
}

/** 搜索历史项 */
export interface SearchHistory {
  keyword: string
  searchTime: string
}

/** 视频搜索结果 */
export interface VideoSearchResult {
  type: 'video'
  list: VideoInfo[]
  total: number
  hasMore: boolean
}

/** 用户搜索结果 */
export interface UserSearchResult {
  type: 'user'
  list: (UserInfo & {
    /** 粉丝数 */
    followerCount: number
    /** 作品数 */
    worksCount: number
  })[]
  total: number
  hasMore: boolean
}

/** 话题搜索结果 */
export interface TopicSearchResult {
  type: 'topic'
  list: TopicInfo[]
  total: number
  hasMore: boolean
}

/** 搜索结果联合类型 */
export type SearchResult = VideoSearchResult | UserSearchResult | TopicSearchResult
