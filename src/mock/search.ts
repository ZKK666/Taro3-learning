/**
 * 搜索相关 Mock 数据
 */

import type { HotSearchItem, SearchSuggestion, SearchHistory, SearchResult } from '@/types/search'
import { mockVideos } from './video'
import { mockUsers } from './user'
import { mockTopics } from './video'

// Mock 热搜数据
const hotSearchList: HotSearchItem[] = [
  { id: 'hot_1', rank: 1, keyword: '舞蹈挑战赛', hotValue: 9999999, tag: 'hot' },
  { id: 'hot_2', rank: 2, keyword: '周末美食推荐', hotValue: 8888888, tag: 'new' },
  { id: 'hot_3', rank: 3, keyword: '萌宠日常', hotValue: 7777777 },
  { id: 'hot_4', rank: 4, keyword: '旅行攻略', hotValue: 6666666, tag: 'recommend' },
  { id: 'hot_5', rank: 5, keyword: '健身教程', hotValue: 5555555 },
  { id: 'hot_6', rank: 6, keyword: '手工DIY', hotValue: 4444444 },
  { id: 'hot_7', rank: 7, keyword: '搞笑视频', hotValue: 3333333 },
  { id: 'hot_8', rank: 8, keyword: '学习技巧', hotValue: 2222222 },
  { id: 'hot_9', rank: 9, keyword: '穿搭分享', hotValue: 1111111 },
  { id: 'hot_10', rank: 10, keyword: '游戏攻略', hotValue: 999999 }
]

// Mock 搜索历史
let searchHistory: SearchHistory[] = [
  { keyword: '舞蹈教学', searchTime: new Date(Date.now() - 3600000).toISOString() },
  { keyword: '家常菜做法', searchTime: new Date(Date.now() - 7200000).toISOString() },
  { keyword: '猫咪', searchTime: new Date(Date.now() - 10800000).toISOString() },
  { keyword: '旅行vlog', searchTime: new Date(Date.now() - 86400000).toISOString() },
  { keyword: '摄影技巧', searchTime: new Date(Date.now() - 172800000).toISOString() }
]

// Mock 处理器
export const searchMock = {
  search(params?: Record<string, any>): SearchResult {
    const { keyword, type = 'video', page = 1, pageSize = 20 } = params || {}

    if (type === 'video') {
      // 模拟视频搜索
      const filtered = mockVideos.filter(v =>
        v.title.includes(keyword) ||
        v.description.includes(keyword) ||
        v.author.nickname.includes(keyword)
      )

      const start = (page - 1) * pageSize
      const end = start + pageSize

      return {
        type: 'video',
        list: filtered.slice(start, end),
        total: filtered.length,
        hasMore: end < filtered.length
      }
    }

    if (type === 'user') {
      // 模拟用户搜索
      const filtered = mockUsers.filter(u =>
        u.nickname.includes(keyword) ||
        u.uniqueId.includes(keyword) ||
        u.bio.includes(keyword)
      )

      const start = (page - 1) * pageSize
      const end = start + pageSize

      return {
        type: 'user',
        list: filtered.slice(start, end).map(u => ({
          ...u,
          followerCount: Math.floor(1000 + Math.random() * 99000),
          worksCount: Math.floor(10 + Math.random() * 90)
        })),
        total: filtered.length,
        hasMore: end < filtered.length
      }
    }

    // 话题搜索
    const filtered = mockTopics.filter(t =>
      t.name.includes(keyword) ||
      t.description.includes(keyword)
    )

    const start = (page - 1) * pageSize
    const end = start + pageSize

    return {
      type: 'topic',
      list: filtered.slice(start, end),
      total: filtered.length,
      hasMore: end < filtered.length
    }
  },

  getSuggestions(params?: Record<string, any>): SearchSuggestion[] {
    const { keyword } = params || {}

    if (!keyword) return []

    // 模拟搜索建议
    return [
      { keyword: `${keyword}教程`, type: 'video', highlight: `<em>${keyword}</em>教程` },
      { keyword: `${keyword}推荐`, type: 'video', highlight: `<em>${keyword}</em>推荐` },
      { keyword: `${keyword}达人`, type: 'user', highlight: `<em>${keyword}</em>达人` }
    ]
  },

  getHotSearch(): HotSearchItem[] {
    return hotSearchList
  },

  getSearchHistory(): SearchHistory[] {
    return searchHistory
  },

  clearSearchHistory(): void {
    searchHistory = []
  },

  deleteSearchHistory(params?: Record<string, any>): void {
    const { keyword } = params || {}
    searchHistory = searchHistory.filter(h => h.keyword !== keyword)
  }
}
