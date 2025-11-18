/**
 * 搜索相关接口服务
 */

import { get, post } from './request'
import type {
  SearchParams,
  SearchResult,
  HotSearchItem,
  SearchSuggestion,
  SearchHistory
} from '@/types/search'

const searchService = {
  /**
   * 搜索
   * GET /search/query
   */
  search(params: SearchParams): Promise<SearchResult> {
    return get('/search/query', params)
  },

  /**
   * 获取搜索建议
   * GET /search/suggest
   */
  getSuggestions(keyword: string): Promise<SearchSuggestion[]> {
    return get('/search/suggest', { keyword })
  },

  /**
   * 获取热搜列表
   * GET /search/hot
   */
  getHotSearch(): Promise<HotSearchItem[]> {
    return get('/search/hot')
  },

  /**
   * 获取搜索历史
   * GET /search/history
   */
  getSearchHistory(): Promise<SearchHistory[]> {
    return get('/search/history')
  },

  /**
   * 清空搜索历史
   * POST /search/clear-history
   */
  clearSearchHistory(): Promise<void> {
    return post('/search/clear-history')
  },

  /**
   * 删除单条搜索历史
   * POST /search/delete-history
   */
  deleteSearchHistory(keyword: string): Promise<void> {
    return post('/search/delete-history', { keyword })
  }
}

export default searchService
