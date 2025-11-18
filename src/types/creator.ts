/**
 * 创作者中心相关类型定义
 */

/** 数据概览 */
export interface CreatorOverview {
  /** 昨日数据 */
  yesterday: {
    playCount: number
    likeCount: number
    commentCount: number
    shareCount: number
    followerIncrement: number
  }
  /** 近7日数据 */
  week: {
    playCount: number
    likeCount: number
    commentCount: number
    shareCount: number
    followerIncrement: number
  }
  /** 总数据 */
  total: {
    worksCount: number
    totalPlayCount: number
    totalLikeCount: number
    followerCount: number
  }
}

/** 作品分析数据 */
export interface WorkAnalysis {
  videoId: string
  title: string
  coverUrl: string
  createTime: string
  /** 播放数据 */
  playData: {
    total: number
    trend: number[]  // 近7天趋势
  }
  /** 互动数据 */
  interactionData: {
    likeCount: number
    commentCount: number
    shareCount: number
    collectCount: number
  }
  /** 完播率 */
  completionRate: number
  /** 平均播放时长 */
  avgPlayDuration: number
  /** 流量来源 */
  trafficSource: {
    recommend: number      // 推荐
    following: number      // 关注
    search: number         // 搜索
    personal: number       // 个人主页
    other: number          // 其他
  }
}

/** 粉丝分析数据 */
export interface FansAnalysis {
  /** 粉丝总数 */
  totalCount: number
  /** 粉丝增长趋势（近30天） */
  growthTrend: {
    date: string
    increment: number
    total: number
  }[]
  /** 粉丝画像 */
  portrait: {
    /** 性别分布 */
    gender: {
      male: number
      female: number
      unknown: number
    }
    /** 年龄分布 */
    age: {
      '18-': number
      '18-24': number
      '25-30': number
      '31-40': number
      '40+': number
    }
    /** 地域分布 TOP10 */
    region: {
      name: string
      count: number
      percentage: number
    }[]
    /** 活跃时段 */
    activeTime: {
      hour: number
      percentage: number
    }[]
  }
}

/** 创作灵感 */
export interface CreationInspiration {
  id: string
  /** 类型: hot_topic-热门话题, trend-趋势, template-模板 */
  type: 'hot_topic' | 'trend' | 'template'
  /** 标题 */
  title: string
  /** 描述 */
  description: string
  /** 封面图 */
  coverUrl: string
  /** 参与人数 */
  participantCount: number
  /** 热度值 */
  hotValue: number
}
