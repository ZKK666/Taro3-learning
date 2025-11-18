/**
 * 视频相关接口服务
 */

import { get, post } from './request'
import type {
  VideoInfo,
  VideoListParams,
  UserVideoParams,
  PublishVideoParams,
  PublishVideoResult
} from '@/types/video'
import type { PaginationData } from '@/types/api'

const videoService = {
  /**
   * 获取视频列表
   * GET /video/list
   */
  getVideoList(params: VideoListParams): Promise<PaginationData<VideoInfo>> {
    return get('/video/list', params)
  },

  /**
   * 获取视频详情
   * GET /video/detail
   */
  getVideoDetail(videoId: string): Promise<VideoInfo> {
    return get('/video/detail', { videoId })
  },

  /**
   * 获取用户作品/喜欢列表
   * GET /video/user
   */
  getUserVideos(params: UserVideoParams): Promise<PaginationData<VideoInfo>> {
    return get('/video/user', params)
  },

  /**
   * 点赞视频
   * POST /video/like
   */
  likeVideo(videoId: string): Promise<{ likeCount: number }> {
    return post('/video/like', { videoId })
  },

  /**
   * 取消点赞
   * POST /video/unlike
   */
  unlikeVideo(videoId: string): Promise<{ likeCount: number }> {
    return post('/video/unlike', { videoId })
  },

  /**
   * 收藏视频
   * POST /video/collect
   */
  collectVideo(videoId: string): Promise<{ collectCount: number }> {
    return post('/video/collect', { videoId })
  },

  /**
   * 取消收藏
   * POST /video/uncollect
   */
  uncollectVideo(videoId: string): Promise<{ collectCount: number }> {
    return post('/video/uncollect', { videoId })
  },

  /**
   * 发布视频
   * POST /video/publish
   */
  publishVideo(params: PublishVideoParams): Promise<PublishVideoResult> {
    return post('/video/publish', params)
  },

  /**
   * 删除视频
   * POST /video/delete
   */
  deleteVideo(videoId: string): Promise<void> {
    return post('/video/delete', { videoId })
  },

  /**
   * 举报视频
   * POST /video/report
   */
  reportVideo(videoId: string, reason: string): Promise<void> {
    return post('/video/report', { videoId, reason })
  }
}

export default videoService
