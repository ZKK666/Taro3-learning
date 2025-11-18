/**
 * 依赖优化指南与工具
 *
 * 【学习要点】为什么要优化依赖？
 *
 * npm 包往往包含大量未使用的代码
 * 正确的引入方式可以减少 50% 以上的体积
 *
 * 这个文件提供：
 * 1. 常见依赖的优化引入方式
 * 2. 轻量替代方案推荐
 * 3. 动态导入示例
 */

// ==================== 工具函数的正确引入方式 ====================

/**
 * 【学习要点】Lodash 按需引入
 *
 * ❌ 错误方式 - 引入整个库 (~70KB)
 * import _ from 'lodash'
 * _.debounce(fn, 300)
 *
 * ✅ 正确方式 - 只引入需要的函数 (~1KB)
 * import debounce from 'lodash/debounce'
 *
 * 或者使用 lodash-es + Tree Shaking
 * import { debounce } from 'lodash-es'
 */

// 常用 lodash 函数的轻量实现
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastTime = 0

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}

/**
 * 【学习要点】日期处理库选择
 *
 * ❌ moment.js - 约 300KB（含 locale）
 *
 * ✅ 替代方案：
 * - dayjs - 约 2KB，API 兼容 moment
 * - date-fns - 约 4KB（按需引入）
 *
 * 小程序中推荐使用 dayjs
 */

// 简单的日期格式化（无需依赖）
export function formatDate(
  date: Date | number | string,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string {
  const d = new Date(date)

  const map: Record<string, string> = {
    'YYYY': d.getFullYear().toString(),
    'MM': (d.getMonth() + 1).toString().padStart(2, '0'),
    'DD': d.getDate().toString().padStart(2, '0'),
    'HH': d.getHours().toString().padStart(2, '0'),
    'mm': d.getMinutes().toString().padStart(2, '0'),
    'ss': d.getSeconds().toString().padStart(2, '0')
  }

  let result = format
  Object.entries(map).forEach(([key, value]) => {
    result = result.replace(key, value)
  })

  return result
}

// 相对时间（如：3分钟前）
export function formatRelativeTime(date: Date | number | string): string {
  const now = Date.now()
  const target = new Date(date).getTime()
  const diff = now - target

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`
  if (diff < day) return `${Math.floor(diff / hour)}小时前`
  if (diff < 7 * day) return `${Math.floor(diff / day)}天前`

  return formatDate(date, 'MM-DD')
}

/**
 * 【学习要点】数字处理
 *
 * 避免引入 big.js、decimal.js 等库
 * 简单场景用原生方法即可
 */

// 格式化数字（千分位）
export function formatNumber(num: number): string {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + '亿'
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}

// 金额格式化
export function formatMoney(amount: number, decimals: number = 2): string {
  return amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 【学习要点】深拷贝
 *
 * ❌ lodash.cloneDeep - 约 4KB
 *
 * ✅ 简单场景用 JSON 方式
 * ✅ 复杂场景用 structuredClone (新 API)
 */
export function deepClone<T>(obj: T): T {
  // 简单场景：JSON 方式（不支持函数、循环引用）
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  // 现代浏览器支持 structuredClone
  if (typeof structuredClone === 'function') {
    return structuredClone(obj)
  }

  return JSON.parse(JSON.stringify(obj))
}

// ==================== 动态导入示例 ====================

/**
 * 【学习要点】动态导入重型模块
 *
 * 对于只在特定场景使用的大型库
 * 使用动态 import() 延迟加载
 */

// 示例：动态加载图表库
export async function loadChartLibrary() {
  /**
   * 使用 import() 动态加载
   * Webpack 会自动将其分割为单独的 chunk
   */
  // const echarts = await import('echarts/core')
  // return echarts
  console.log('Chart library loaded dynamically')
}

// 示例：动态加载富文本编辑器
export async function loadRichTextEditor() {
  // const Quill = await import('quill')
  // return Quill.default
  console.log('Rich text editor loaded dynamically')
}

// ==================== 依赖检查工具 ====================

/**
 * 【学习要点】依赖大小检查
 *
 * 使用工具分析依赖大小：
 * - npm install -g cost-of-modules
 * - npx cost-of-modules
 *
 * 或者使用在线工具：
 * - https://bundlephobia.com/
 */

// 常见重型依赖及其轻量替代
export const heavyDependenciesAlternatives = {
  // 工具库
  'lodash': {
    size: '~70KB',
    alternatives: ['lodash-es (Tree Shaking)', '单独引入 lodash/xxx', '自己实现常用函数']
  },

  // 日期处理
  'moment': {
    size: '~300KB',
    alternatives: ['dayjs (~2KB)', 'date-fns (~4KB)', '原生 Date']
  },

  // 请求库
  'axios': {
    size: '~14KB',
    alternatives: ['Taro.request (内置)', 'ky (~3KB)']
  },

  // 状态管理
  'redux + react-redux': {
    size: '~20KB',
    alternatives: ['zustand (~3KB)', 'jotai (~3KB)', 'React Context']
  },

  // 表单验证
  'formik + yup': {
    size: '~40KB',
    alternatives: ['react-hook-form (~8KB)', '自定义 hooks']
  },

  // 动画
  'framer-motion': {
    size: '~50KB',
    alternatives: ['CSS 动画', '@tarojs/taro 动画 API']
  },

  // 图表
  'echarts': {
    size: '~800KB',
    alternatives: ['echarts 按需引入 (~100KB)', 'F2 (~100KB)', 'wx-charts']
  }
}

/**
 * 【学习要点】Tree Shaking 最佳实践
 *
 * 要让 Tree Shaking 生效：
 *
 * 1. 使用 ES6 模块 (import/export)
 *    ❌ const _ = require('lodash')
 *    ✅ import { debounce } from 'lodash-es'
 *
 * 2. package.json 设置 sideEffects
 *    {
 *      "sideEffects": false
 *    }
 *    或指定有副作用的文件：
 *    {
 *      "sideEffects": ["*.css", "*.scss"]
 *    }
 *
 * 3. 避免重新导出全部
 *    ❌ export * from './utils'
 *    ✅ export { specificFn } from './utils'
 */

// 导出所有工具函数
export default {
  debounce,
  throttle,
  formatDate,
  formatRelativeTime,
  formatNumber,
  formatMoney,
  deepClone,
  loadChartLibrary,
  loadRichTextEditor,
  heavyDependenciesAlternatives
}
