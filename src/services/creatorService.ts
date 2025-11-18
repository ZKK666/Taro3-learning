/**
 * 创作者中心相关接口服务
 */

import { get } from './request'
import type {
  CreatorOverview,
  WorkAnalysis,
  FansAnalysis,
  CreationInspiration
} from '@/types/creator'
import type { PaginationData } from '@/types/api'

const creatorService = {
  /**
   * 获取数据概览
   * GET /creator/overview
   */
  getOverview(): Promise<CreatorOverview> {
    return get('/creator/overview')
  },

  /**
   * 获取作品列表（带数据）
   * GET /creator/works
   */
  getWorksList(page: number, pageSize: number): Promise<PaginationData<WorkAnalysis>> {
    return get('/creator/works', { page, pageSize })
  },

  /**
   * 获取单个作品分析
   * GET /creator/work-analysis
   */
  getWorkAnalysis(videoId: string): Promise<WorkAnalysis> {
    return get('/creator/work-analysis', { videoId })
  },

  /**
   * 获取粉丝分析
   * GET /creator/fans-analysis
   */
  getFansAnalysis(): Promise<FansAnalysis> {
    return get('/creator/fans-analysis')
  },

  /**
   * 获取创作灵感
   * GET /creator/inspiration
   */
  getInspiration(page: number, pageSize: number): Promise<PaginationData<CreationInspiration>> {
    return get('/creator/inspiration', { page, pageSize })
  }
}

export default creatorService
