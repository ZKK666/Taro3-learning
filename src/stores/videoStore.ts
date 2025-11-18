/**
 * 视频状态管理
 */

import { create } from 'zustand'
import type { VideoInfo } from '@/types/video'
import { videoService } from '@/services'

interface VideoState {
  /** 推荐视频列表 */
  recommendList: VideoInfo[]
  /** 关注视频列表 */
  followingList: VideoInfo[]
  /** 当前播放索引 */
  currentIndex: number
  /** 当前 Tab: recommend-推荐, following-关注 */
  currentTab: 'recommend' | 'following'
  /** 是否正在加载 */
  loading: boolean
  /** 是否还有更多 */
  hasMore: boolean
  /** 当前页码 */
  page: number
  /** 加载推荐视频 */
  fetchRecommendVideos: (refresh?: boolean) => Promise<void>
  /** 加载关注视频 */
  fetchFollowingVideos: (refresh?: boolean) => Promise<void>
  /** 切换 Tab */
  setCurrentTab: (tab: 'recommend' | 'following') => void
  /** 设置当前播放索引 */
  setCurrentIndex: (index: number) => void
  /** 点赞视频 */
  likeVideo: (videoId: string) => Promise<void>
  /** 取消点赞 */
  unlikeVideo: (videoId: string) => Promise<void>
}

export const useVideoStore = create<VideoState>((set, get) => ({
  recommendList: [],
  followingList: [],
  currentIndex: 0,
  currentTab: 'recommend',
  loading: false,
  hasMore: true,
  page: 1,

  fetchRecommendVideos: async (refresh = false) => {
    const { loading, hasMore, page, recommendList } = get()

    if (loading || (!refresh && !hasMore)) return

    set({ loading: true })

    const currentPage = refresh ? 1 : page
    const result = await videoService.getVideoList({
      type: 'recommend',
      page: currentPage,
      pageSize: 10
    })

    set({
      recommendList: refresh ? result.list : [...recommendList, ...result.list],
      hasMore: result.hasMore,
      page: currentPage + 1,
      loading: false
    })
  },

  fetchFollowingVideos: async (refresh = false) => {
    const { loading, followingList } = get()

    if (loading) return

    set({ loading: true })

    const result = await videoService.getVideoList({
      type: 'following',
      page: refresh ? 1 : Math.ceil(followingList.length / 10) + 1,
      pageSize: 10
    })

    set({
      followingList: refresh ? result.list : [...followingList, ...result.list],
      loading: false
    })
  },

  setCurrentTab: (tab: 'recommend' | 'following') => {
    set({ currentTab: tab, currentIndex: 0 })
  },

  setCurrentIndex: (index: number) => {
    set({ currentIndex: index })
  },

  likeVideo: async (videoId: string) => {
    const { recommendList, followingList } = get()

    await videoService.likeVideo(videoId)

    // 更新列表中的点赞状态
    const updateList = (list: VideoInfo[]) =>
      list.map(v =>
        v.id === videoId
          ? { ...v, isLiked: true, likeCount: v.likeCount + 1 }
          : v
      )

    set({
      recommendList: updateList(recommendList),
      followingList: updateList(followingList)
    })
  },

  unlikeVideo: async (videoId: string) => {
    const { recommendList, followingList } = get()

    await videoService.unlikeVideo(videoId)

    const updateList = (list: VideoInfo[]) =>
      list.map(v =>
        v.id === videoId
          ? { ...v, isLiked: false, likeCount: Math.max(0, v.likeCount - 1) }
          : v
      )

    set({
      recommendList: updateList(recommendList),
      followingList: updateList(followingList)
    })
  }
}))
