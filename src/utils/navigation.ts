/**
 * 路由导航工具
 */

import Taro from '@tarojs/taro'

/**
 * 页面跳转
 */
export function navigateTo(url: string, params?: Record<string, any>): Promise<TaroGeneral.CallbackResult> {
  const queryString = params
    ? '?' + Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&')
    : ''

  return Taro.navigateTo({ url: url + queryString })
}

/**
 * 页面重定向
 */
export function redirectTo(url: string, params?: Record<string, any>): Promise<TaroGeneral.CallbackResult> {
  const queryString = params
    ? '?' + Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&')
    : ''

  return Taro.redirectTo({ url: url + queryString })
}

/**
 * 返回上一页
 */
export function navigateBack(delta = 1): Promise<TaroGeneral.CallbackResult> {
  return Taro.navigateBack({ delta })
}

/**
 * 切换 Tab
 */
export function switchTab(url: string): Promise<TaroGeneral.CallbackResult> {
  return Taro.switchTab({ url })
}

/**
 * 关闭所有页面，打开新页面
 */
export function reLaunch(url: string): Promise<TaroGeneral.CallbackResult> {
  return Taro.reLaunch({ url })
}

// 页面路径常量
export const Routes = {
  // 主包
  INDEX: '/pages/index/index',
  FRIENDS: '/pages/friends/index',
  PROFILE: '/pages/profile/index',
  LOGIN: '/pages/login/index',

  // 视频分包
  FEED: '/packageVideo/pages/feed/index',
  VIDEO_DETAIL: '/packageVideo/pages/detail/index',
  COMMENT: '/packageVideo/pages/comment/index',
  USER: '/packageVideo/pages/user/index',
  MUSIC: '/packageVideo/pages/music/index',

  // 搜索分包
  SEARCH: '/packageSearch/pages/index/index',
  SEARCH_RESULT: '/packageSearch/pages/result/index',
  TOPIC: '/packageSearch/pages/topic/index',

  // 直播分包
  LIVE_LIST: '/packageLive/pages/list/index',
  LIVE_ROOM: '/packageLive/pages/room/index',

  // 创作者中心分包
  CREATOR_CENTER: '/packageCreator/pages/index/index',
  CREATOR_WORKS: '/packageCreator/pages/works/index',
  CREATOR_FANS: '/packageCreator/pages/fans/index',
  CREATOR_INSPIRATION: '/packageCreator/pages/inspiration/index',

  // 设置分包
  SETTINGS: '/packageSettings/pages/index/index',
  SETTINGS_ACCOUNT: '/packageSettings/pages/account/index',
  SETTINGS_PRIVACY: '/packageSettings/pages/privacy/index',
  SETTINGS_NOTIFICATION: '/packageSettings/pages/notification/index',
  SETTINGS_GENERAL: '/packageSettings/pages/general/index',
  SETTINGS_ABOUT: '/packageSettings/pages/about/index',
  EDIT_PROFILE: '/packageSettings/pages/edit-profile/index',

  // 私信分包
  CHAT_LIST: '/packageChat/pages/list/index',
  CHAT_CONVERSATION: '/packageChat/pages/conversation/index',

  // 发布分包（原生）
  PUBLISH_CHOOSE: '/packagePublish/pages/choose/index',
  PUBLISH_EDIT: '/packagePublish/pages/edit/index',
  PUBLISH_POST: '/packagePublish/pages/post/index',

  // 消息分包（原生）
  MESSAGE_CENTER: '/packageMessage/pages/index/index',
  MESSAGE_LIKES: '/packageMessage/pages/likes/index',
  MESSAGE_COMMENTS: '/packageMessage/pages/comments/index',
  MESSAGE_FOLLOWERS: '/packageMessage/pages/followers/index',
  MESSAGE_SYSTEM: '/packageMessage/pages/system/index'
}
