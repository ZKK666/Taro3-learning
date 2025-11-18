/**
 * 设置相关类型定义
 */

/** 用户设置 */
export interface UserSettings {
  /** 账号与安全 */
  account: {
    phone: string
    isPhoneBound: boolean
    isWechatBound: boolean
    isQQBound: boolean
    isWeiboBound: boolean
  }
  /** 隐私设置 */
  privacy: {
    /** 谁可以看我的作品 */
    videoVisibility: 'all' | 'friends' | 'self'
    /** 谁可以看我的喜欢列表 */
    likesVisibility: 'all' | 'friends' | 'self'
    /** 谁可以给我发私信 */
    messagePermission: 'all' | 'friends' | 'none'
    /** 谁可以和我合拍 */
    duetPermission: 'all' | 'friends' | 'none'
    /** 谁可以@我 */
    atPermission: 'all' | 'friends' | 'none'
    /** 是否允许推荐给可能认识的人 */
    allowRecommend: boolean
    /** 是否允许通过手机号找到我 */
    allowFindByPhone: boolean
  }
  /** 通知设置 */
  notification: {
    /** 私信通知 */
    messageNotify: boolean
    /** 点赞通知 */
    likeNotify: boolean
    /** 评论通知 */
    commentNotify: boolean
    /** 新粉丝通知 */
    followerNotify: boolean
    /** @我通知 */
    atNotify: boolean
    /** 系统通知 */
    systemNotify: boolean
    /** 直播通知 */
    liveNotify: boolean
    /** 免打扰时段 */
    quietHours?: {
      enabled: boolean
      start: string  // HH:mm
      end: string    // HH:mm
    }
  }
  /** 通用设置 */
  general: {
    /** 自动播放 */
    autoPlay: boolean
    /** WiFi下自动播放下一个 */
    autoPlayNext: boolean
    /** 默认画质 */
    videoQuality: 'auto' | 'high' | 'medium' | 'low'
    /** 深色模式 */
    darkMode: 'auto' | 'light' | 'dark'
    /** 字体大小 */
    fontSize: 'small' | 'medium' | 'large'
  }
}

/** 缓存信息 */
export interface CacheInfo {
  /** 总缓存大小（字节） */
  totalSize: number
  /** 视频缓存 */
  videoCache: number
  /** 图片缓存 */
  imageCache: number
  /** 其他缓存 */
  otherCache: number
}

/** 关于信息 */
export interface AboutInfo {
  /** 应用版本 */
  version: string
  /** 构建号 */
  buildNumber: string
  /** 更新日志 */
  changelog: string
  /** 是否有新版本 */
  hasUpdate: boolean
  /** 新版本信息 */
  newVersion?: {
    version: string
    description: string
    downloadUrl: string
  }
}
