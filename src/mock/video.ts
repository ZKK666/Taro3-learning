/**
 * 视频相关 Mock 数据
 */

import type { VideoInfo, TopicInfo, PublishVideoResult } from '@/types/video'
import type { PaginationData } from '@/types/api'
import { mockUsers } from './user'

// Mock 话题数据
export const mockTopics: TopicInfo[] = [
  {
    id: 'topic_001',
    name: '舞蹈挑战',
    description: '展示你的舞蹈才华',
    coverUrl: 'https://picsum.photos/200/200?random=t1',
    videoCount: 125000,
    participantCount: 89000,
    viewCount: 5600000
  },
  {
    id: 'topic_002',
    name: '美食制作',
    description: '分享美味的制作过程',
    coverUrl: 'https://picsum.photos/200/200?random=t2',
    videoCount: 89000,
    participantCount: 67000,
    viewCount: 3200000
  },
  {
    id: 'topic_003',
    name: '萌宠日常',
    description: '记录萌宠的可爱瞬间',
    coverUrl: 'https://picsum.photos/200/200?random=t3',
    videoCount: 156000,
    participantCount: 120000,
    viewCount: 8900000
  },
  {
    id: 'topic_004',
    name: '旅行vlog',
    description: '分享旅途中的精彩',
    coverUrl: 'https://picsum.photos/200/200?random=t4',
    videoCount: 78000,
    participantCount: 56000,
    viewCount: 2800000
  },
  {
    id: 'topic_005',
    name: '知识分享',
    description: '学习新知识新技能',
    coverUrl: 'https://picsum.photos/200/200?random=t5',
    videoCount: 234000,
    participantCount: 180000,
    viewCount: 12000000
  }
]

// Mock 视频数据
export const mockVideos: VideoInfo[] = Array.from({ length: 50 }, (_, i) => ({
  id: `video_${String(i + 1).padStart(3, '0')}`,
  title: getRandomTitle(i),
  description: getRandomDescription(i),
  coverUrl: `https://picsum.photos/720/1280?random=${i + 1}`,
  videoUrl: `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4`,
  duration: Math.floor(15 + Math.random() * 45),
  width: 720,
  height: 1280,
  playCount: Math.floor(1000 + Math.random() * 99000),
  likeCount: Math.floor(100 + Math.random() * 9900),
  commentCount: Math.floor(10 + Math.random() * 990),
  shareCount: Math.floor(5 + Math.random() * 495),
  collectCount: Math.floor(10 + Math.random() * 490),
  isLiked: Math.random() > 0.7,
  isCollected: Math.random() > 0.8,
  author: mockUsers[i % mockUsers.length],
  topics: [mockTopics[i % mockTopics.length]],
  createTime: getRandomTime(i),
  visibility: 'public'
}))

function getRandomTitle(index: number): string {
  const titles = [
    '今天也是元气满满的一天',
    '这个舞蹈太上头了',
    '教你做一道超简单的家常菜',
    '我家猫咪又在搞事情了',
    '这个地方真的太美了',
    '分享一个超实用的小技巧',
    '终于学会了这个动作',
    '周末的正确打开方式',
    '来看看我的新作品',
    '这波操作你给几分'
  ]
  return titles[index % titles.length]
}

function getRandomDescription(index: number): string {
  const descriptions = [
    '记录美好生活的每一天 #日常 #生活',
    '练习了好久终于成功了！#舞蹈挑战',
    '简单几步就能搞定 #美食教程 #家常菜',
    '它又开始发疯了哈哈哈 #萌宠 #猫咪日常',
    '强烈推荐这个宝藏景点 #旅行 #风景',
    '学到就是赚到 #知识分享 #干货',
    '坚持就是胜利 #运动 #健身打卡',
    '慵懒的周末时光 #vlog #日常',
    '希望大家喜欢 #原创 #创作',
    '你们觉得怎么样？#互动 #评论'
  ]
  return descriptions[index % descriptions.length]
}

function getRandomTime(index: number): string {
  const now = Date.now()
  const offset = index * 3600000 + Math.random() * 3600000
  return new Date(now - offset).toISOString()
}

// Mock 处理器
export const videoMock = {
  getVideoList(params?: Record<string, any>): PaginationData<VideoInfo> {
    const { page = 1, pageSize = 10 } = params || {}
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const list = mockVideos.slice(start, end)

    return {
      list,
      total: mockVideos.length,
      page,
      pageSize,
      hasMore: end < mockVideos.length
    }
  },

  getVideoDetail(params?: Record<string, any>): VideoInfo | null {
    const { videoId } = params || {}
    return mockVideos.find(v => v.id === videoId) || null
  },

  getUserVideos(params?: Record<string, any>): PaginationData<VideoInfo> {
    const { userId, type = 'works', page = 1, pageSize = 20 } = params || {}
    let videos = mockVideos.filter(v => v.author.id === userId)

    if (type === 'likes') {
      videos = mockVideos.filter(v => v.isLiked).slice(0, 30)
    }

    const start = (page - 1) * pageSize
    const end = start + pageSize
    const list = videos.slice(start, end)

    return {
      list,
      total: videos.length,
      page,
      pageSize,
      hasMore: end < videos.length
    }
  },

  likeVideo(params?: Record<string, any>): { likeCount: number } {
    const { videoId } = params || {}
    const video = mockVideos.find(v => v.id === videoId)
    if (video) {
      video.isLiked = true
      video.likeCount += 1
      return { likeCount: video.likeCount }
    }
    return { likeCount: 0 }
  },

  unlikeVideo(params?: Record<string, any>): { likeCount: number } {
    const { videoId } = params || {}
    const video = mockVideos.find(v => v.id === videoId)
    if (video) {
      video.isLiked = false
      video.likeCount = Math.max(0, video.likeCount - 1)
      return { likeCount: video.likeCount }
    }
    return { likeCount: 0 }
  },

  collectVideo(params?: Record<string, any>): { collectCount: number } {
    const { videoId } = params || {}
    const video = mockVideos.find(v => v.id === videoId)
    if (video) {
      video.isCollected = true
      video.collectCount += 1
      return { collectCount: video.collectCount }
    }
    return { collectCount: 0 }
  },

  uncollectVideo(params?: Record<string, any>): { collectCount: number } {
    const { videoId } = params || {}
    const video = mockVideos.find(v => v.id === videoId)
    if (video) {
      video.isCollected = false
      video.collectCount = Math.max(0, video.collectCount - 1)
      return { collectCount: video.collectCount }
    }
    return { collectCount: 0 }
  },

  publishVideo(_params?: Record<string, any>): PublishVideoResult {
    return {
      videoId: `video_${Date.now()}`,
      status: 'success',
      message: '发布成功'
    }
  },

  deleteVideo(_params?: Record<string, any>): void {
    // Mock 删除操作
  }
}
