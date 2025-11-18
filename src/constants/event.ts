/**
 * 事件名常量
 */

export const EVENTS = {
  // 用户相关
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  USER_INFO_UPDATE: 'user:info_update',

  // 视频相关
  VIDEO_LIKE: 'video:like',
  VIDEO_UNLIKE: 'video:unlike',
  VIDEO_COLLECT: 'video:collect',
  VIDEO_PUBLISH: 'video:publish',
  VIDEO_DELETE: 'video:delete',

  // 关注相关
  USER_FOLLOW: 'user:follow',
  USER_UNFOLLOW: 'user:unfollow',

  // 评论相关
  COMMENT_POST: 'comment:post',
  COMMENT_DELETE: 'comment:delete',

  // 消息相关
  MESSAGE_READ: 'message:read',
  MESSAGE_REFRESH: 'message:refresh',

  // 网络状态
  NETWORK_CHANGE: 'network:change',

  // 刷新相关
  REFRESH_HOME: 'refresh:home',
  REFRESH_PROFILE: 'refresh:profile'
}
