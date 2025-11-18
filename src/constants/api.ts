/**
 * API 路径常量
 */

// 视频相关
export const API_VIDEO = {
  LIST: '/video/list',
  DETAIL: '/video/detail',
  USER_VIDEOS: '/video/user',
  LIKE: '/video/like',
  UNLIKE: '/video/unlike',
  COLLECT: '/video/collect',
  UNCOLLECT: '/video/uncollect',
  PUBLISH: '/video/publish',
  DELETE: '/video/delete',
  REPORT: '/video/report'
}

// 用户相关
export const API_USER = {
  LOGIN: '/user/login',
  INFO: '/user/info',
  DETAIL: '/user/detail',
  UPDATE: '/user/update',
  FOLLOW: '/user/follow',
  UNFOLLOW: '/user/unfollow',
  FOLLOW_LIST: '/user/follow-list',
  CHECK_LOGIN: '/user/check-login',
  LOGOUT: '/user/logout'
}

// 评论相关
export const API_COMMENT = {
  LIST: '/comment/list',
  REPLY_LIST: '/comment/reply-list',
  POST: '/comment/post',
  REPLY: '/comment/reply',
  LIKE: '/comment/like',
  UNLIKE: '/comment/unlike',
  DELETE: '/comment/delete',
  REPORT: '/comment/report'
}

// 搜索相关
export const API_SEARCH = {
  QUERY: '/search/query',
  SUGGEST: '/search/suggest',
  HOT: '/search/hot',
  HISTORY: '/search/history',
  CLEAR_HISTORY: '/search/clear-history',
  DELETE_HISTORY: '/search/delete-history'
}

// 消息相关
export const API_MESSAGE = {
  CENTER: '/message/center',
  UNREAD_COUNT: '/message/unread-count',
  LIST: '/message/list',
  READ: '/message/read',
  READ_ALL: '/message/read-all',
  DELETE: '/message/delete'
}
