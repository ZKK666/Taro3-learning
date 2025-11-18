/**
 * 音乐相关接口服务
 */

import { get, post } from './request'
import type { MusicInfo, MusicListParams, MusicSearchParams } from '@/types/music'
import type { PaginationData } from '@/types/api'

const musicService = {
  /**
   * 获取音乐列表
   * GET /music/list
   */
  getMusicList(params: MusicListParams): Promise<PaginationData<MusicInfo>> {
    return get('/music/list', params)
  },

  /**
   * 获取音乐详情
   * GET /music/detail
   */
  getMusicDetail(musicId: string): Promise<MusicInfo> {
    return get('/music/detail', { musicId })
  },

  /**
   * 搜索音乐
   * GET /music/search
   */
  searchMusic(params: MusicSearchParams): Promise<PaginationData<MusicInfo>> {
    return get('/music/search', params)
  },

  /**
   * 收藏音乐
   * POST /music/collect
   */
  collectMusic(musicId: string): Promise<{ isCollected: boolean }> {
    return post('/music/collect', { musicId })
  },

  /**
   * 取消收藏
   * POST /music/uncollect
   */
  uncollectMusic(musicId: string): Promise<{ isCollected: boolean }> {
    return post('/music/uncollect', { musicId })
  },

  /**
   * 获取使用该音乐的视频
   * GET /music/videos
   */
  getMusicVideos(musicId: string, page: number, pageSize: number): Promise<PaginationData<any>> {
    return get('/music/videos', { musicId, page, pageSize })
  }
}

export default musicService
