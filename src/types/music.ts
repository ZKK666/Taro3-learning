/**
 * 音乐/BGM 相关类型定义
 */

/** 音乐信息 */
export interface MusicInfo {
  id: string
  /** 音乐标题 */
  title: string
  /** 作者/歌手 */
  author: string
  /** 封面图 */
  coverUrl: string
  /** 音乐文件 URL */
  musicUrl: string
  /** 时长（秒） */
  duration: number
  /** 使用次数 */
  useCount: number
  /** 是否已收藏 */
  isCollected: boolean
  /** 是否原声 */
  isOriginal: boolean
}

/** 音乐列表请求参数 */
export interface MusicListParams {
  /** 类型: hot-热门, new-最新, collected-收藏 */
  type: 'hot' | 'new' | 'collected'
  page: number
  pageSize: number
}

/** 音乐搜索参数 */
export interface MusicSearchParams {
  keyword: string
  page: number
  pageSize: number
}
