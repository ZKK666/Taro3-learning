/**
 * 包大小优化工具集
 *
 * 【学习要点】这个模块提供了完整的小程序包大小优化方案
 *
 * 包含：
 * 1. 图片 CDN 优化 - 减少包内图片资源
 * 2. 依赖优化 - 轻量工具函数替代重型库
 *
 * 配合使用：
 * - scripts/analyze-size.js - 分析包大小
 * - config/index.js - Webpack 优化配置
 * - src/app.config.ts - 分包和预加载配置
 *
 * 使用示例：
 * ```ts
 * import {
 *   getCdnUrl,
 *   debounce,
 *   formatDate
 * } from '@/utils/optimization'
 *
 * // CDN 图片优化
 * const imageUrl = getCdnUrl('https://cdn.com/image.jpg', {
 *   width: 200,
 *   format: 'webp'
 * })
 *
 * // 使用轻量工具函数
 * const debouncedFn = debounce(() => {}, 300)
 * const dateStr = formatDate(new Date())
 * ```
 */

// 图片 CDN 优化
export {
  initCdnConfig,
  getCdnUrl,
  getResponsiveSrcSet,
  preloadImage,
  preloadImages,
  getPlaceholder,
  getAspectRatioPadding,
  isWebPSupported,
  getPixelRatio,
  default as imageCdn
} from './imageCdn'

// 轻量依赖替代
export {
  debounce,
  throttle,
  formatDate,
  formatRelativeTime,
  formatNumber,
  formatMoney,
  deepClone,
  loadChartLibrary,
  loadRichTextEditor,
  heavyDependenciesAlternatives,
  default as dependencyOptimize
} from './dependencyOptimize'

/**
 * 【学习要点】优化检查清单
 *
 * 开发时参考这个清单，确保代码符合优化要求
 */
export const optimizationChecklist = {
  // 分包优化
  subpackages: [
    '主包只放首屏必要页面',
    '按业务模块划分分包',
    '配置分包预下载规则',
    '使用 lazyCodeLoading'
  ],

  // 图片优化
  images: [
    '大图片上传 CDN',
    '使用 WebP 格式',
    '根据屏幕尺寸请求合适大小',
    '图片懒加载',
    '小图标使用 base64 或 iconfont'
  ],

  // 依赖优化
  dependencies: [
    '按需引入（如 lodash/debounce）',
    '使用轻量替代（如 dayjs 替代 moment）',
    '避免重复依赖',
    '定期审计依赖大小'
  ],

  // 代码优化
  code: [
    '使用 ES6 模块支持 Tree Shaking',
    '移除未使用的代码和依赖',
    '生产环境移除 console.log',
    '压缩 CSS 类名'
  ],

  // 构建优化
  build: [
    '开启 Terser 压缩',
    '开启 CSS 压缩',
    '开启 WXML 压缩',
    '使用 Bundle Analyzer 分析'
  ]
}

/**
 * 【学习要点】快速诊断函数
 *
 * 用于开发时快速检查优化状态
 */
export function diagnoseOptimization(): void {
  console.group('📊 包大小优化诊断')

  // 检查环境
  console.log('环境:', process.env.NODE_ENV)
  console.log('是否生产模式:', process.env.NODE_ENV === 'production')

  // 提示信息
  console.log('\n运行 `npm run analyze` 查看详细包大小分析')
  console.log('运行 `npm run analyze:bundle` 查看可视化依赖图')

  console.groupEnd()
}
