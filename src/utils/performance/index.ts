/**
 * 性能优化工具集
 *
 * 导出所有性能相关的工具和Hooks
 */

// 视频预加载
export {
  default as videoPreloader,
  useVideoPreload,
} from './videoPreload'

// 图片懒加载
export {
  default as imageLazyLoadManager,
  toWebPUrl,
  getResponsiveUrl,
} from './imageLazyLoad'
export type { LazyLoadConfig, ImageStatus } from './imageLazyLoad'

// 请求缓存
export {
  default as useRequest,
  useInfiniteRequest,
  prefetch,
  clearCache,
  getCachedData,
} from './useRequest'

// 代码分割
export {
  default as codeSplitting,
  createLazyComponent,
  preloadModule,
  preloadModules,
  createLazyRoutes,
  createModuleLoader,
  createConditionalLazy,
  createProgressLoader,
} from './codeSplitting'

/**
 * 性能优化最佳实践
 *
 * 【视频预加载】
 * - 在视频Feed中，预加载当前视频后面的2-3个
 * - WiFi环境下才预加载大文件
 * - 使用LRU策略管理缓存
 *
 * 【图片懒加载】
 * - 使用Intersection Observer监测可见性
 * - 提供占位图和错误图
 * - 支持WebP格式转换
 * - 实现错误重试机制
 *
 * 【骨架屏】
 * - 布局与真实内容保持一致
 * - 使用shimmer动画提示加载中
 * - 避免布局抖动
 *
 * 【请求缓存】
 * - Stale-While-Revalidate策略
 * - 合理设置缓存和过期时间
 * - 实现乐观更新提升体验
 *
 * 【代码分割】
 * - 路由级别分割
 * - 大型组件懒加载
 * - 预加载可能需要的模块
 */
