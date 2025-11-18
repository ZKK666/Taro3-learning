/**
 * 格式化工具函数
 */

/**
 * 格式化数字（如播放量、点赞数）
 * @param num 数字
 * @returns 格式化后的字符串
 */
export function formatNumber(num: number): string {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + '亿'
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

/**
 * 格式化时间为相对时间
 * @param time ISO 时间字符串或时间戳
 * @returns 相对时间字符串
 */
export function formatRelativeTime(time: string | number): string {
  const now = Date.now()
  const target = typeof time === 'string' ? new Date(time).getTime() : time
  const diff = now - target

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day

  if (diff < minute) {
    return '刚刚'
  }
  if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前'
  }
  if (diff < day) {
    return Math.floor(diff / hour) + '小时前'
  }
  if (diff < week) {
    return Math.floor(diff / day) + '天前'
  }
  if (diff < month) {
    return Math.floor(diff / week) + '周前'
  }
  if (diff < year) {
    return Math.floor(diff / month) + '个月前'
  }
  return Math.floor(diff / year) + '年前'
}

/**
 * 格式化视频时长
 * @param seconds 秒数
 * @returns 格式化后的时长字符串
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * 格式化日期
 * @param time ISO 时间字符串或时间戳
 * @param format 格式
 * @returns 格式化后的日期字符串
 */
export function formatDate(time: string | number, format = 'YYYY-MM-DD'): string {
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * formatTime 是 formatRelativeTime 的别名
 */
export const formatTime = formatRelativeTime
